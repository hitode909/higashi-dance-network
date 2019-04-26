run:
	cd public/kasanegi/ && npm run build
	dev_appserver.py app.yaml
deploy:
	cd public/kasanegi/ && npm run build
	gcloud app deploy --project higashi-dance-network --no-promote
deploy-promote:
	cd public/kasanegi/ && npm run build
	gcloud app deploy --project higashi-dance-network --promote