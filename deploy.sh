#frontend
cd reservations-frontend
npm run build
scp -r build mail.m2rocks.de:/home/jorgo/mythos/frontend_builds/
cd ..

#backend
rm backend/node_modules -rf
mv backend/.env backend/.env_dev
scp -r backend mail.m2rocks.de:/home/jorgo/mythos/
mv backend/.env_dev backend/.env
ssh mail.m2rocks.de "cd mythos/backend/ && pm2 delete all"
ssh mail.m2rocks.de "cd mythos/backend/ && npm i && pm2 start src/app.js --name mythos-backend"
