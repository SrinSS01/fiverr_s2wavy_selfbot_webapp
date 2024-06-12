FROM node:22.3.0
WORKDIR /app/frontend
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3000
RUN yarn run build
CMD [ "yarn", "run", "start" ]