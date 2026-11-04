import { program } from 'commander'
import { createComponent } from './command/create-component'
import { docRefresh } from './command/doc-refresh'
import { doDeleteNodeModules } from './command/delete-node-modules'
import { c } from './util/log-utils'
import inquirer, { QuestionCollection } from 'inquirer'

const createComponentEntry = () => {
  c('nc-demo-ui cli create tool')

  program.version(require('../package').version)
    .usage('<command> [arguments]')

  program.command('create')
    .description('create a new component')
    .alias('c')
    .action(createComponent)

  program.parse(process.argv)

  if (!program.args.length) {
    program.help()
  }
}

const refreshDocEntry = () => {
  c('nc-demo-ui cli refresh doc tool')

  program.version(require('../package').version)
    .usage('<command> [arguments]')

  program.command('create')
    .description(`refresh a component's doc.md`)
    .alias('c')
    .action(docRefresh)

  program.parse(process.argv)

  if (!program.args.length) {
    program.help()
  }
}

// 交互提示
const questions: QuestionCollection = [
  {
    type: 'list',
    name: 'cliType',
    message: 'Choose the cli type: ',
    choices: [
      'create-components', 'refresh-doc', 'delete-node-modules'
    ]
  }
]
export const mainEntry = () => {
  c('open nc-demo-ui cli')

  inquirer.prompt(questions).then(({ cliType }) => {
    switch (cliType) {
      case 'create-components': createComponentEntry();break;
      case 'refresh-doc': refreshDocEntry();break;
      case 'delete-node-modules': doDeleteNodeModules();break;
    }
  })
  // createComponentEntry()
}
