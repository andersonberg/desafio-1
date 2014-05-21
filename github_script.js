'use strict';

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
        github.repos.push(responseObj[repositorio]);
 
        // var request = new XMLHttpRequest();
        // request.onload = github.printStarsCount;
        // var url = 'https://api.github.com/repos/globocom/' + repo_name;
        // request.open('get', url, true);
        // request.send();
    }
    github.repos.sort(function(a,b) {return b.stargazers_count - a.stargazers_count});
    for(var repo in github.repos){
        console.log(github.repos[repo].name);
    }
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