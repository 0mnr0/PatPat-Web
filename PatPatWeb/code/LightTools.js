const find = function(selector) { return document.querySelector(selector) };
const findAll = function(selector) { return document.querySelectorAll(selector) };
const findById = function(selector) { return document.getElementById(selector) };
const HTML = document.documentElement;
const body = document.body;
const head = document.head;
const print = console.log;	
const log = console.log;	
const warn = console.warn;	
const sleep = ms => new Promise(res => setTimeout(res, ms));
const random = (min, max) => {
    min = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
}
