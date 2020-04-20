# ResmatUi

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.22-1.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g c component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

# AWS
```
ng build

//doesnot work
ng build --target=production --aot=false

sudo systemctl status nginx
sudo systemctl restart nginx

scp -i ~/.ssh/aws_key_pair.pem -r dist/* ubuntu@ec2-3-120-209-125.eu-central-1.compute.amazonaws.com:~/hosted

scp -i ~/.ssh/aws_key_pair.pem -r environment ubuntu@ec2-52-57-195-49.eu-central-1.compute.amazonaws.com:~/hosted

scp -i ~/.ssh/aws_key_pair.pem -r config ubuntu@ec2-3-120-209-125.eu-central-1.compute.amazonaws.com:~/hosted
scp -i ~/.ssh/aws_key_pair.pem -r img/zmi ubuntu@ec2-3-120-209-125.eu-central-1.compute.amazonaws.com:~/hosted/img
```
