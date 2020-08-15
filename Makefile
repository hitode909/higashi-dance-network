run:
	cd public/kasanegi/ && npm run build
	npm start
deploy:
	cd public/kasanegi/ && npm run build
	gcloud app deploy --project higashi-dance-network --no-promote
deploy-promote:
	cd public/kasanegi/ && npm run build
	gcloud app deploy --project higashi-dance-network --promote