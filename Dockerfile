FROM node:8.11.1-alpine
MAINTAINER Francesco Tonini <francescoantoniotonini@gmail.com>
ENV REFRESHED_AT 2018-04-15

COPY . src/
RUN echo "Move to /src and install app dependencies"  \
	&& cd /src \
	&& npm install --production \
	&& echo "Done :)"

# Expose ports to host
EXPOSE 5000

# Se envs
ENV NODE_ENV=production

# Start
CMD ["node", "/src/index.js"]
