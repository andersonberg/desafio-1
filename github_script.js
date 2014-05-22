'use strict';
var Commit = function(user_login, commit_message, commit_date){
    this.user_login = user_login;
    this.commit_message = commit_message;
    this.commit_date = commit_date;
};

var Projeto = function(name, stars, forks){
    this.name = name;
    this.stars = stars;
    this.forks = forks;
    this.commits = [];
};

Projeto.prototype.getCommits = function(){
    var url = 'https://api.github.com/repos/globocom/' + this.name + '/commits';

    var request = new XMLHttpRequest();
    request.onload = setCommits;
    request.open('get', url, true);
    request.send();
};

function setCommits(){
    var responseObj = JSON.parse(this.responseText);
    var commits_list = [];
    for(var i in responseObj){
        var user_login = responseObj[i].author.login;
        var commit_message = responseObj[i].commit.message;
        var commit_date = responseObj[i].commit.author.date;

        var commit = new Commit(user_login, commit_message, commit_date);
        commits_list.push(commit);
    }

    return commits_list;
};

var Github = function(){
    this.public_repos = 0;
    this.count_pages = 0;
    this.repos_names = [];
    this.repos = [];
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
    var items = [];
    $.each(github.repos, function(i){
        //items.push('<a href="#"><li>' + github.repos[i].name + '</li></a>');
        ul.innerHTML = ul.innerHTML + '<li class="sel"> <a href="#">' + github.repos[i].name + '</a></li>'; //+ ' : stars: ' + github.repos[i].stars + ' forks: ' + github.repos[i].forks + '</li>'
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
request.open('get', 'https://api.github.com/users/globocom', true);
request.send();
