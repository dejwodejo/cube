# get bun image
FROM oven/bun:latest

# set the working dir
WORKDIR /app

# copy package files
COPY package*.json bun.lockb* ./

# install deps
RUN bun install

# copy the rest of project
COPY . .

# expose port
EXPOSE 5173

# start app
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]