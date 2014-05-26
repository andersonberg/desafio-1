'use strict';

//função que é chamada ao clicar no nome de um repositório
$("#repos_list").on("click", "li a", function(event){
    //Adiciona a classe 'sel' para adicionar o triângulo
    //primeiro remove a classe de todos os itens, pra que não apareçam vários triângulos
    $("#repos_list li").removeClass("sel");
    var id_element = "#" + this.text;
    $(id_element).addClass("sel");

    var ul_commits = document.getElementById("list_commits");
    ul_commits.innerHTML = "";

    github.repos.filter(github.findProject, this);

    event.preventDefault();
});

//funcionalidade do botão "Carregar mais"
$("#list_commits").on("click", "#carrega_mais", function(){
    $('#list_commits li:hidden').slice(0,20).show();
    if($('#list_commits li').length == $('#list_commits li:visible').length){
        $('#carrega_mais').hide();
    }
});

//Função que formata a data javascript
function formatDate(date) {
  var newDate = new Date(date);
  var year = newDate.getFullYear().toString();
  var month = (newDate.getMonth()+1).toString();
  var day = newDate.getDate().toString();

  return (day[1]?day:"0"+day[0]) + '/' + (month[1]?month:"0"+month[0]) + '/' + year;
}

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
    }
    showCommits(commits_list);
};

function showCommits(commits_list){
    var ul_commits = document.getElementById("list_commits");
    ul_commits.innerHTML = "";

    //exibe a lista de commits na tela
    for(var comm in commits_list){
        ul_commits.innerHTML = ul_commits.innerHTML + '<li><div class="li_commit"><h1>' + commits_list[comm].commit_message + '</h1><h3>'+ formatDate(commits_list[comm].commit_date) +'</h3><h2>@' + commits_list[comm].user_login + '</h2></div></li>';    
    }

    //botão "Carregar mais"
    ul_commits.innerHTML = ul_commits.innerHTML + '<a id="carrega_mais" class="carrega_mais">Carregar mais</a>';
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

    //exibe a lista de itens na tela
    var ul = document.getElementById("repos_list");
    $.each(github.repos, function(i){
        ul.innerHTML = ul.innerHTML + '<li id="' + github.repos[i].name + '"><a>' + github.repos[i].name + '</a></li>';
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
