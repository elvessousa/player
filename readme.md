# Base

Este repositório contém uma estrutura básica para projetos web e visa facilitar a vida do desenvolvimento no que tange à organização de pastas e configuração de gerenciador de tarefas repetitivas.

***

## Estrutura de diretórios
- **adm:** Para área de administração, caso o projeto tenha uma.
- **bin:** Diretorio do *bower*, se preferir utilizar outro local, basta alterar o arquivo `.bowerrc`. Por padrão ele não está versionado, se quiser alterar isso, basta editar o `.gitignore`.
- **inc:** Diretório de includes.
- **pub:** Contém CSS, JS e imagens finais para uso no frontend.
- **src:** Contém arquivos fonte Sass, JS ou outros que sejam necessários para o projeto.
- **tmpl:** Pasta de templates.

#### Diretórios temporários
Este diretórios só são necessários no ambiente de desenvolvimento, sendo descartados do versionamento:

- **.sass-cache:** Criado na compilação do Sass.
- **node_modules:** Criado na compilação do Sass.

***

## Instalação
Para instalar os arquivos necessários, confira se todas as dependências abaixo estão satisfeitas. Caso estejam, basta executar no terminal:

```
$ npm install
```

```
$ bower install
```

O primeiro instala o *gulp* e seus plugins e o segundo instala as outras dependências (Ex.: angular, bootstrap-css e jquery).

***


## Dependências para a instalação

### NPM: node package manager
Se você não possui o node instalado, baixe o [nodejs](https://nodejs.org) no site, ou utilize um [gerenciador de pacotes](https://nodejs.org/en/download/package-manager/) de sua preferência. Após isso o npm estará instalado no seu sistema.

### Gulp
É um automatizador de tarefas. Para configurá-lo use o arquivo `gulpfile.js` que está na raiz do projeto. Mais informações em http://gulpjs.com. Caso queira instalar o gulp no sistema execute:

```
$ (sudo) npm install -g gulp
```

#### Utilização
Para rodar as tarefas configuradas no `gulpfile.js`:

```
$ gulp
```

ou

```
$ gulp nome-da-tarefa
```

#### Plugins do Gulp/NPM usados nesta estrutura
- **gulp-concat:** Junta arquivos.
- **gulp-rename:** Renomeia arquivos.
- **gulp-jshint:** Verifica a qualidade de seu código Javascript.
- **gulp-uglify:** Minifica arquivos.
- **gulp-ruby-sass:** Compila arquivos Sass.
- **gulp-sourcemaps:** Mapeia o código dos arquivos minificados.
- **gulp-imagemin:** Minifica imagens.
- **imagemin-pngquant:** Auxilia a minificar arquivos PNG (Portable Network Graphics).
- **gulp-shell:** Executa tarefas com comandos de terminal (UNIX).
- **kss:** Knyle Style Sheets, usado para documentação de estilos Sass/LESS/CSS. Saiba mais no [site do projeto](http://warpspire.com/kss/).

Para instalar outro plugin que necessite, basta executar o comando abaixo:

```
$ npm install <nome-do-plugin>
```

Para adiciona-lo nas dependências do projeto, adicione `--save` no final do comando:

```
$ npm install <nome-do-plugin> --save
```

Use `--save-dev`, para listá-lo como dependência para o desenvolvimento:

```
$ npm install <nome-do-plugin> --save
```

### Bower
O *Bower* administra dependências, como frameworks de JS ou CSS, eliminando a necessidade de substituir/atualizar arquivos manualmente, e com isso  eliminá-los do versionamento do git. Caso queira instalar o *Bower* no sistema execute:

```
$ (sudo) npm install -g bower
```

#### Utilização
Para encontrar uma dependência no bower:

```
$ bower search
```

Para instalar:

```
$ bower install <nome-do-repositorio>
```

Para informações mais específicas, consulte o [site do Bower](http://bower.io).
