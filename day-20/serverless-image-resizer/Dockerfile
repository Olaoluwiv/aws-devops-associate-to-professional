FROM public.ecr.aws/lambda/nodejs:24

COPY package.json ${LAMBDA_TASK_ROOT}/

RUN npm install --no-audit --no-fund && rm -rf node_modules/.bin

COPY index.mjs ${LAMBDA_TASK_ROOT}/

CMD [ "index.handler" ]