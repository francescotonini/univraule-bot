FROM node:6.10.1-alpine

# Copy source code and install modules
COPY package.json /src/package.json
RUN cd /src; npm install

# Copy app bundle
COPY ./lib /src/lib
COPY ./index.js /src

# Expost api port
EXPOSE 5000

# Here we go
CMD ["node", "/src/index.js"]
