'use strict';

var repo_commits = [];

//função que é chamada ao clicar no nome de um repositório
function stats(){
    github.repos.filter(github.findProject, this);
};

//Classe Commit representa cada commit em um repositório
var Commit = function(user_login, commit_message, commit_date){
    this.user_login = user_login;
    this.commit_message = commit_message;
    this.commit_date = commit_date;
};

//Classe Projeto representa um repositório
var Projeto = function(name, stars, forks){
    this.name = name;
    this.stars = stars;
    this.forks = forks;
    this.commits = [];
};

//Obtém todos os commits de um repositório
Projeto.prototype.getCommits = function(){
    var url = 'https://api.github.com/repos/globocom/' + this.name + '/commits?login=andersonberg&authToken=f94236ae56d6c2325123261daf99c439e8d2cd66';

    var request = new XMLHttpRequest();
    request.onload = setCommits;
    request.open('get', url, true);
    request.send();
};

//Cria objetos Commit e popula a lista de commits de um repositório
function setCommits(){
    var responseObj = JSON.parse(this.responseText);
    var commits_list = [];
    for(var i in responseObj){
        var user_login = responseObj[i].author.login;
        var commit_message = responseObj[i].commit.message;
        var commit_date = responseObj[i].commit.author.date;

        var commit = new Commit(user_login, commit_message, commit_date);
        commits_list.push(commit);
        // repo_commits.push(commit);
    }
    var list_commits = document.getElementById("list_commits");
    list_commits.innerHTML = "";

    for(var comm in commits_list){
        list_commits.innerHTML = list_commits.innerHTML + '<li>' + commits_list[comm].user_login + ' ' + commits_list[comm].commit_message + '</li>';
    }
};

//Classe Github representa um objeto que centraliza as informações de todos os repositórios
var Github = function(){
    this.public_repos = 0;
    this.count_pages = 0;
    this.repos_names = [];
    this.repos = [];
};

//procura pelo nome do repositório dentro da lista e exibe suas estatísticas
Github.prototype.findProject = function(element){
    var stars = document.getElementById("stars");
    var forks = document.getElementById("forks");
    if(element.name == this.text){
        stars.innerHTML = "stars: " + element.stars;
        forks.innerHTML = "forks: " + element.forks;
        element.getCommits();
    }
};
 
Github.prototype.printStarsCount = function(){
    var responseObj = JSON.parse(this.responseText);
    console.log(responseObj.name + ' possui ' + responseObj.stargazers_count + ' estrelas');
};
 
Github.prototype.getReposNames = function(){
    var responseObj = JSON.parse(this.responseText);
    for (var repositorio in responseObj){
        var repo_name = responseObj[repositorio].name;
        var repo_stars = responseObj[repositorio].stargazers_count;
        var repo_forks = responseObj[repositorio].forks;

        //cria um novo objeto Projeto
        var repo = new Projeto(repo_name, repo_stars, repo_forks);
        github.repos.push(repo);
    }
    github.repos.sort(function(a,b) {return b.stars - a.stars});

    var ul = document.getElementById("repos_list");
    //var items = [];
    $.each(github.repos, function(i){
        //items.push('<a href="#"><li>' + github.repos[i].name + '</li></a>');
        ul.innerHTML = ul.innerHTML + '<li class="sel"> <a onclick="stats.call(this);return false;">' + github.repos[i].name + '</a></li>';
    });
};

Github.prototype.repoCount = function(){
    var responseObj = JSON.parse(this.responseText);
 
    //pega o numero de repositorios publicos
    github.public_repos = responseObj.public_repos;
    //conta o numero de paginas necessarias para acessar todos os repositorios
    github.count_pages = Math.ceil(github.public_repos/100);
 
    //varre todas as paginas e pega o nome de cada repositorio
    for(var i = 1; i <= github.count_pages; i++){
        var request = new XMLHttpRequest();
        request.onload = github.getReposNames;
        var url = 'https://api.github.com/users/globocom/repos?page=' + i + '&per_page=100';
        request.open('get', url, true);
        request.send();
    }
};

var request = new XMLHttpRequest();
var github = new Github();
request.onload = github.repoCount;
request.open('get', 'https://api.github.com/users/globocom?login=andersonberg&authToken=f94236ae56d6c2325123261daf99c439e8d2cd66', true);
request.send();
