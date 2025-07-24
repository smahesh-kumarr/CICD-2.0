# 🌟 MERN Application CI/CD Pipeline 🚀

Welcome to the **MERN Application CI/CD Pipeline** project! This repository showcases a robust, automated, and modern CI/CD pipeline built for a MERN (MongoDB, Express.js, React, Node.js) application. The pipeline leverages cutting-edge DevOps tools to ensure seamless code integration, testing, quality checks, containerization, and deployment to a Kubernetes cluster. 🎉

This project demonstrates my expertise in DevOps practices, containerization, and orchestration, making it a standout piece in my portfolio. Explore the setup, pipeline stages, and technologies below! 💻

---

## 📋 Project Overview

This project automates the deployment of a MERN application using a CI/CD pipeline. The pipeline integrates code from a GitHub repository, runs tests, performs code quality checks, builds Docker images, pushes them to DockerHub, and deploys to a Kubernetes cluster managed by ArgoCD. The pipeline ensures high-quality code, fast deployments, and continuous synchronization with the latest updates.

### 🛠️ Tech Stack
- **Frontend**: Vite + React.js ⚛️
- **Backend**: Express.js 🖥️
- **Database**: MongoDB, MongoDB Atlas 🍃
- **CI/CD Tools**:
  - **Jenkins**: Pipeline automation 🤖
  - **Git & GitHub**: Version control 📂
  - **Jest**: Unit testing 🧪
  - **SonarQube**: Code quality analysis 📊
  - **Docker & DockerHub**: Containerization and image registry 🐳
  - **ArgoCD & Image Updater**: Continuous deployment and image updates 🚀
  - **Kubernetes**: Container orchestration ☸️
- **Infrastructure**: EC2 Machine, Local Ubuntu Virtual Machine 🖥️

---

## 📸 Project Setup Snapshot

![Project Overview](images/project-overview.png)  
*Placeholder for project overview image. Replace with actual image link.*

---

## 🚀 CI/CD Pipeline Stages

The pipeline is orchestrated using **Jenkins** running on a local Ubuntu VM as a localhost setup. Below are the detailed stages of the pipeline, each designed to ensure a smooth and reliable deployment process.

### 1️⃣ **Git Clone**
- **Purpose**: Pulls the latest code from the GitHub repository.
- **Prerequisites**:
  - Git installed on the Jenkins VM.
  - Jenkins Git plugin installed and configured.
- **Trigger**: SCM polling (`* * * * *`) to build on every commit.
- **Pipeline Code**:
```groovy
stage('Git Clone') {
    steps {
        git branch: 'main', url: 'https://github.com/smahesh-kumarr/CICD-2.0.git'
    }
}
```
- **Output**: Successfully clones the `main` branch of the repository.

---

### 2️⃣ **Install Dependencies**
- **Purpose**: Installs Node.js dependencies for both frontend and backend.
- **Prerequisites**:
  - Node.js v23.13.0 installed on the Jenkins VM.
  - NodeJS plugin installed and configured in Jenkins.
- **Pipeline Code**:
```groovy
stage('Install Dependencies') {
    steps {
        dir('client') {
            sh 'npm install'
        }
        dir('server') {
            sh 'npm install'
        }
    }
}
```
- **Output**: Dependencies installed for both frontend (`client`) and backend (`server`) directories.



---

### 3️⃣ **Testing Stage**
- **Purpose**: Runs unit tests for the frontend using Jest.
- **Prerequisites**:
  - Jest configured for testing.
  - Sample test cases created for `Welcome.jsx` component.
- **Pipeline Code**:
```groovy
stage('Test') {
    steps {
        sh 'cd client && npx jest src/components/_tests_/Welcome.test.jsx'
    }
}
```
- **Output**: Tests for `Welcome.jsx` executed successfully.

![Testing Stage](images/testing-stage.png)  
*Placeholder for testing stage image.*

---

### 4️⃣ **SonarQube Analysis**
- **Purpose**: Analyzes code quality for both frontend and backend using SonarQube.
- **Prerequisites**:
  - PostgreSQL and SonarQube set up on the Ubuntu VM.
  - SonarQube token created and added to Jenkins credentials (`SonarQubeToken`).
  - SonarQube Scanner plugin and Quality Gates plugin installed in Jenkins.
  - SonarQube server configured with public IP: `http://52.90.151.34:9000/`.
- **Pipeline Code**:
```groovy
stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv(credentialsId: 'SonarQubeToken', installationName: 'sonarserver') {
            script {
                def scannerHome = tool 'sonar-scanner'
                dir('client') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=mern-app-client"
                }
                dir('server') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=mern-app-server"
                }
            }
        }
    }
}
```
- **Output**: Code quality analysis completed, results displayed on SonarQube dashboard.

![SonarQube Analysis](images/sonarqube-analysis.png)  
*Placeholder for SonarQube analysis image.*

---

### 5️⃣ **Build Docker Images**
- **Purpose**: Builds Docker images for frontend and backend using their respective Dockerfiles.
- **Prerequisites**:
  - Docker engine installed on the Jenkins VM.
  - Docker plugin installed in Jenkins.
- **Dockerfiles**:
  - **Client Dockerfile**:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app /app
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev"]
```
  - **Server Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npx", "nodemon", "server.js"]
```
- **Pipeline Code**:
```groovy
stage('Build Docker Images') {
    steps {
        script {
            dir('client') {
                docker.build("maheshkumars772/cicd-client:${TAG_VERSION}")
            }
            dir('server') {
                docker.build("maheshkumars772/cicd-server:${TAG_VERSION}")
            }
        }
    }
}
```
- **Output**: Docker images built for both frontend and backend.

![Image building Stage](images/Image-building-stage.png)  
*Placeholder for testing stage image.*


---

### 6️⃣ **Push Docker Images to DockerHub**
- **Purpose**: Pushes the built Docker images to DockerHub.
- **Prerequisites**:
  - DockerHub credentials added to Jenkins (`DockerHubCreds`).
- **Pipeline Code**:
```groovy
stage('Push Docker Images') {
    steps {
        script {
            docker.withRegistry('https://registry.hub.docker.com', 'DockerHubCreds') {
                docker.image("maheshkumars772/cicd-client:${TAG_VERSION}").push()
                docker.image("maheshkumars772/cicd-server:${TAG_VERSION}").push()
            }
        }
    }
}
```
- **Output**: Images successfully pushed to DockerHub.

![DockerHub Push](images/dockerhub-push.png)  
*Placeholder for DockerHub push image.*

---

### 7️⃣ **Update Deployment File**
- **Purpose**: Updates the Kubernetes deployment YAML with the latest image tags.
- **Prerequisites**:
  - Kubernetes manifests repository: [Image-Updater-CICD](https://github.com/smahesh-kumarr/Image-Updater-CICD.git).
  - GitHub credentials added to Jenkins (`github`).
- **Pipeline Code**:
```groovy
stage('Update Deployment File') {
    steps {
        dir('manifests') {
            git url: "https://github.com/${GIT_USER_NAME}/${GIT_REPO_NAME}.git", branch: 'main', credentialsId: 'github'
            withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GITHUB_TOKEN')]) {
                sh '''
                git config user.email "maheshkumar08042006@gmail.com"
                git config user.name "smahesh-kumarr"
                sed -i "s|maheshkumars772/cicd-client:v[0-9]*|maheshkumars772/cicd-client:${TAG_VERSION}|g" deployment.yaml
                sed -i "s|maheshkumars772/cicd-server:v[0-9]*|maheshkumars772/cicd-server:${TAG_VERSION}|g" deployment.yaml
                git add deployment.yaml
                git commit -m "Update image tags to ${TAG_VERSION}" || echo "No changes to commit"
                git push https://$GIT_USERNAME:$GITHUB_TOKEN@github.com/$GIT_USER_NAME/$GIT_REPO_NAME.git HEAD:main
                '''
            }
        }
    }
}
```
- **Output**: Kubernetes deployment YAML updated with the latest image tags.

![Scripts updates](images/Image-updates.png)  
*Placeholder for CI/CD stage image.*

![CI-ENDS](images/CI-END.png)  
*Placeholder for CI/CD stage image.*


---

### 8️⃣ **Kubernetes & ArgoCD Setup**

![VMS-On-Local](images/Servers.png)  
*Placeholder for CI/CD stage image.*

- **Purpose**: Deploys the application to a Kubernetes cluster with ArgoCD for continuous synchronization.
- **Kubernetes Setup**:
  - Single-node Kubernetes cluster set up using `kubeadm` on the local VM.
  - Components: `kubelet`, `kube-apiserver`, `crictl`, and CNI plugins.
  - Cluster configured with untainted master node and IP ranges assigned.
- **ArgoCD Setup**:
  1. Created `argocd` namespace and installed ArgoCD:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
  2. Verified pods:
```bash
kubectl get pods -n argocd
```
  3. Port-forwarded ArgoCD server:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
  4. Logged in using the default admin password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```
  5. Installed ArgoCD Image Updater:
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```
  6. Generated SSH key for GitHub access:
```bash
ssh-keygen -t rsa -b 4096 -C "maheshkumar08042006@gmail.com"
```
  7. Added public key to GitHub repository’s deploy keys with write access.
  8. Created a secret for Git credentials:
```bash
kubectl create secret generic git-creds --from-file=sshPrivateKey=~/.ssh/id_rsa -n argocd
```
  9. Configured ArgoCD Image Updater interval (30 seconds):
```yaml
metadata:
  name: mern-app
  namespace: argocd
  annotations:
    argocd-image-updater.argoproj.io/image-list: backend=maheshkumars772/cicd-backend,frontend=maheshkumars772/cicd-frontend
    argocd-image-updater.argoproj.io/write-back-method: git:secret:argocd/git-creds
    argocd-image-updater.argoproj.io/git-branch: main
    argocd-image-updater.argoproj.io/backend.update-strategy: semver
    argocd-image-updater.argoproj.io/frontend.update-strategy: semver
    argocd-image-updater.argoproj.io/backend.force-update: "true"
    argocd-image-updater.argoproj.io/frontend.force-update: "true"
    argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+$
    argocd-image-updater.argoproj.io/frontend.allow-tags: regexp:^v[0-9]+$
spec:
  project: default
  source:
    repoURL: https://github.com/smahesh-kumarr/Image-Updater-CICD.git
    path: .
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: mern-app
  syncPolicy:
    automated: {}
```
- **Output**: ArgoCD syncs the application every 30 seconds, automatically deploying new images.

![ArgoCD Sync](images/argocd-sync.png)  
*Placeholder for ArgoCD sync image.*

---

## 📂 Kubernetes Resources

The Kubernetes manifests are stored in the [Image-Updater-CICD](https://github.com/smahesh-kumarr/Image-Updater-CICD.git) repository. They include:
- **Frontend Deployment**: Deploys the React frontend.
- **Backend Deployment**: Deploys the Express.js backend.
- **Frontend Service**: Exposed as NodePort.
- **Backend Service**: Exposed as NodePort.

![Frontend Pod](images/Frontend-Pod.png)  
*Placeholder for frontend pod image.*

![Backend Pod](images/Backend-Pod.png)  
*Placeholder for Backend pod image.*
---

## 🎥 Output Video

[Watch the Pipeline in Action](https://drive.google.com/file/d/1l2mtgID86NKQEwffeh28KKgzSuYiZiJs/view?usp=drive_link)  
*Placeholder for Google Drive video link. Replace with actual link.*

---

## 🏆 Achievements

- **Automated CI/CD Pipeline**: Fully automated from code commit to deployment.
- **Code Quality**: Ensured with Jest tests and SonarQube analysis.
- **Containerization**: Dockerized frontend and backend for portability.
- **Continuous Deployment**: Achieved with ArgoCD and Image Updater for real-time updates.
- **Scalable Infrastructure**: Deployed on a Kubernetes cluster for reliability.

---

## 📧 Contact

**Author**: Mahesh Kumar S  
**Email**: [maheshkumar08042006@gmail.com](mailto:maheshkumar08042006@gmail.com)  
**GitHub**: [smahesh-kumarr](https://github.com/smahesh-kumarr)

Feel free to reach out for questions, feedback, or collaboration! 🌟

---

## 🎉 Conclusion

This project showcases a modern CI/CD pipeline for a MERN application, integrating industry-standard tools like Jenkins, Docker, Kubernetes, and ArgoCD. It demonstrates my ability to build scalable, automated, and high-quality DevOps workflows. Explore the repository, try the pipeline, and let me know your thoughts! 🚀