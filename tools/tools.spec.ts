/* tslint:disable:no-console */

import * as fs from 'fs';
import * as path from 'path';

const nixt = require('nixt');
const rimraf = require('rimraf');

const testModulePath: string = path.join(path.resolve(process.cwd()), 'src/app/testModule');
const appActionsPath: string = path.join(path.resolve(process.cwd()), 'src/app/actions.ts');
const appGettersPath: string = path.join(path.resolve(process.cwd()), 'src/app/getters.ts');
const appMutationsPath: string = path.join(path.resolve(process.cwd()), 'src/app/mutations.ts');
const appRoutesPath: string = path.join(path.resolve(process.cwd()), 'src/app/router.ts');

const testComponentPath: string = path.join(path.resolve(process.cwd()), 'src/app/TestComponent');
const testConnectedComponentPath: string = path.join(path.resolve(process.cwd()), 'src/app/TestConnectedComponent');

describe('tools', () => {
  afterAll(() => {
    rimraf(testModulePath, () => {
      console.log('testModule deleted');
    });

    rimraf(testComponentPath, () => {
      console.log('testComponent deleted');
    });

    rimraf(testConnectedComponentPath, () => {
      console.log('testConnectedComponent deleted');
    });

    let appActions: string = fs.readFileSync(appActionsPath).toString();
    appActions = appActions.replace('\nimport * as testModuleActions from \'./testModule/actions\';', '');
    appActions = appActions.replace('\nimport { ITestModuleActions, TestModuleActions } from \'./testModule/actions\';', '');
    appActions = appActions.replace(', ITestModuleActions', '');
    appActions = appActions.replace('\n  ...TestModuleActions,', '');

    fs.writeFileSync(appActionsPath, appActions);

    let appGetters: string = fs.readFileSync(appGettersPath).toString();
    appGetters = appGetters.replace('\nimport { ITestModuleGetters, TestModuleGetters } from \'./testModule/getters\';', '');
    appGetters = appGetters.replace(', ITestModuleGetters', '');
    appGetters = appGetters.replace('\n  ...TestModuleGetters,', '');

    fs.writeFileSync(appGettersPath, appGetters);

    let appMutations: string = fs.readFileSync(appMutationsPath).toString();
    appMutations = appMutations.replace('\nimport { ITestModuleState, ITestModuleMutations, TestModuleDefaultState, TestModuleMutations } from \'./testModule/mutations\';', '');
    appMutations = appMutations.replace(', ITestModuleState', '');
    appMutations = appMutations.replace(', ITestModuleMutations', '');
    appMutations = appMutations.replace('\n  ...TestModuleDefaultState,', '');
    appMutations = appMutations.replace('\n  ...TestModuleMutations,', '');

    fs.writeFileSync(appMutationsPath, appMutations);

    let appRoutes: string = fs.readFileSync(appRoutesPath).toString();
    appRoutes = appRoutes.replace('\nimport { TestModuleRoutes } from \'./testModule/routes\';', '');
    appRoutes = appRoutes.replace('\n    ...TestModuleRoutes,', '');

    fs.writeFileSync(appRoutesPath, appRoutes);
  });

  test('should extract i18n messages', (done) => {
    nixt()
      .run(`npm run extract-i18n-messages`)
      .stdout(/finished/)
      .end(done);
  });

  test('should generate module', (done) => {
    nixt()
      .run(`npm run g -- module "testModule" "yes" "yes"`)
      .expect(() => {
        if (fs.existsSync(testModulePath) === false) {
          return new Error('testModule not created');
        }
      })
      .end(done);
  });

  test('should generate a component', (done) => {
    nixt()
      .run(`npm run g -- component "testComponent"`)
      .expect((result: any) => {
        if (fs.existsSync(testComponentPath) === false) {
          return new Error('testComponent not created');
        }
      })
      .end(done);
  });

  test('should generate a connected component', (done) => {
    nixt()
      .run(`npm run g -- connected "testConnectedComponent"`)
      .expect((result: any) => {
        if (fs.existsSync(testConnectedComponentPath) === false) {
          return new Error('testConnectedComponent not created');
        }
      })
      .end(done);
  });

});
