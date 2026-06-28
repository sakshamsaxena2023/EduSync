FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV MONGO_URI=mongodb://admin:supersecurepassword123@mongo:27017/mystudymatch?authSource=admin
ENV JWT_SECRET=secretkey123

CMD ["npm", "start"]
