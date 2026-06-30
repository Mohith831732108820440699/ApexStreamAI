# CI/CD Pipeline Configurations

StreamTest AI integrates seamlessly with major CI/CD providers. Below are the complete configurations for GitHub Actions, GitLab CI/CD, and Jenkins.

---

## 1. GitHub Actions Workflow

Save this file as `.github/workflows/test.yml` in your repository.

```yaml
name: StreamTest AI CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Build & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: streamtest
          POSTGRES_PASSWORD: streamtest_secure_pass
          POSTGRES_DB: streamtest_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint Code
        run: npm run lint

      - name: Run Unit & Integration Tests (Jest)
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://streamtest:streamtest_secure_pass@localhost:5432/streamtest_db
          REDIS_URL: redis://localhost:6379/0

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E & Visual Regression Tests (Playwright)
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://streamtest:streamtest_secure_pass@localhost:5432/streamtest_db
          REDIS_URL: redis://localhost:6379/0

      - name: Execute Security Vulnerability Audit
        run: npm audit --audit-level=high

      - name: Build Next.js Application
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

  build-and-push:
    name: Build Container & Deploy
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub (or GCR/AWS ECR)
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            streamtest/frontend:latest
            streamtest/frontend:${{ github.sha }}

      - name: Deploy to Kubernetes Cluster
        uses: azure/k8s-deploy@v5
        with:
          manifests: |
            k8s/deployment.yaml
          images: |
            streamtest/frontend:${{ github.sha }}
          namespace: streamtest-ai
```

---

## 2. GitLab CI Configuration

Save this file as `.gitlab-ci.yml` in your repository root.

```yaml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  POSTGRES_USER: streamtest
  POSTGRES_PASSWORD: streamtest_secure_pass
  POSTGRES_DB: streamtest_db
  DATABASE_URL: "postgresql://streamtest:streamtest_secure_pass@postgres:5432/streamtest_db"
  REDIS_URL: "redis://redis:6379/0"

cache:
  paths:
    - node_modules/

default:
  image: node:20-alpine

lint_code:
  stage: lint
  script:
    - npm ci
    - npm run lint

unit_tests:
  stage: test
  services:
    - name: postgres:15-alpine
      alias: postgres
    - name: redis:7-alpine
      alias: redis
  script:
    - npm ci
    - npm run test:unit

e2e_tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  services:
    - name: postgres:15-alpine
      alias: postgres
    - name: redis:7-alpine
      alias: redis
  script:
    - npm ci
    - npx playwright install --with-deps
    - npm run test:e2e

docker_build:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

k8s_deploy:
  stage: deploy
  image: dtzar/helm-kubectl:latest
  script:
    - kubectl config set-cluster k8s --server="$K8S_SERVER" --insecure-skip-tls-verify=true
    - kubectl config set-credentials admin --token="$K8S_TOKEN"
    - kubectl config set-context default --cluster=k8s --user=admin --namespace=streamtest-ai
    - kubectl config use-context default
    - sed -i "s|gcr.io/streamtest-ai/frontend:latest|$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA|g" k8s/deployment.yaml
    - kubectl apply -f k8s/deployment.yaml
  only:
    - main
```

---

## 3. Jenkins Pipeline (Jenkinsfile)

Save this file as `Jenkinsfile` in your repository root.

```groovy
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'streamtest'
        IMAGE_NAME = 'frontend'
        CREDENTIALS_ID = 'docker-hub-credentials'
        K8S_CREDENTIALS_ID = 'kubernetes-config-file'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Run Tests') {
            steps {
                // Run tests inside Docker container helpers or isolated runners
                sh 'npm run test:unit'
                sh 'npx playwright install --with-deps && npm run test:e2e'
            }
        }

        stage('Vulnerability Check') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Build & Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('', CREDENTIALS_ID) {
                        def customImage = docker.build("${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}")
                        customImage.push()
                        customImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                configFileProvider([configFile(fileId: K8S_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl --kubeconfig=$KUBECONFIG apply -f k8s/deployment.yaml'
                    sh "kubectl --kubeconfig=$KUBECONFIG set image deployment/web-deployment web=${DOCKER_REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER} -n streamtest-ai"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please inspect build outputs.'
        }
    }
}
```
