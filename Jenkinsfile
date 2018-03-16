/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
pipeline {
	agent { node { label 'lisk-elements' } }
	stages {
		stage('Install dependencies') {
			steps {
				sh 'npm install --verbose'
			}
		}
		stage('Build') {
			steps {
				sh 'npm run build'
			}
		}
		stage('Run lint') {
			steps {
				ansiColor('xterm') {
					sh 'npm run lint'
				}
			}
		}
		stage('Run tests') {
			steps {
				ansiColor('xterm') {
					sh 'npm run test'
					sh '''
					cp ~/.coveralls.yml .coveralls.yml
					npm run cover
					'''
				}
			}
		}
		stage('Run browser tests') {
			steps {
				sh '''
				npm run build:check
				npm run build:browsertest
				HTTP_PORT=808${EXECUTOR_NUMBER:-0}
				npm run serve:browsertest -- -p $HTTP_PORT >access.log 2>&1 &
				npm run test:browser -- --config baseUrl=http://localhost:$HTTP_PORT
				'''
			}
		}
	}
	post {
		success {
			deleteDir()
			githubNotify context: 'continuous-integration/jenkins/lisk-elements', description: 'The build passed.', status: 'SUCCESS'
		}
		failure {
			archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/'
			githubNotify context: 'continuous-integration/jenkins/lisk-elements', description: 'The build failed.', status: 'FAILURE'
		}
		aborted {
			githubNotify context: 'continuous-integration/jenkins/lisk-elements', description: 'The build was aborted.', status: 'ERROR'
		}
	}
}
