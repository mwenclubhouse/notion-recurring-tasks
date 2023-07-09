FROM ubuntu:22.04

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Ubuntu
RUN apt update
RUN apt upgrade -y
RUN apt install -y curl lsb-release gnupg
RUN curl -s https://deb.nodesource.com/setup_18.x | bash /dev/stdin
RUN apt install -y nodejs
RUN node --version
RUN npm --version

# If you are building your code for production
RUN npm ci --only=production
RUN npm install

# Bundle app source
COPY . .
RUN npm run build

CMD [ "node", "dist/main.js" ]
