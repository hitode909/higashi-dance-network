run:
	npm run watch &
	dev_appserver.py app.yaml
deploy:
	gcloud app deploy --project higashi-dance-network