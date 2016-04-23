"use strict";

// Helper functions
function range(start, end, step) {
  var ret = [];
  if (arguments.length === 1) {
    end = start;
    start = 0;
  }
  end = end || 0;
  step = step || 1;
  for (ret;
    (end - start) * step > 0; start += step) {
    ret.push(start);
  }
  return ret;
}



// main code
function GameField(fieldId) {
  this.field = document.querySelector('#' + fieldId);
  this.activeCount = 0;
  this.PICTURE_URLS = ['https://kde.link/test/1.png',
    'https://kde.link/test/2.png',
    'https://kde.link/test/9.png',
    'https://kde.link/test/7.png',
    'https://kde.link/test/6.png',
    'https://kde.link/test/3.png',
    'https://kde.link/test/4.png',
    'https://kde.link/test/0.png',
    'https://kde.link/test/5.png',
    'https://kde.link/test/8.png',
  ]
}

GameField.prototype.getJSONData = function getJSONData(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4) return;
    if (xhr.status != 200) {
      console.log(xhr.status + ': ' + xhr.statusText);
    } else {
      if (callback) {
        callback(xhr.responseText);
      } else {
        console.log(xhr.responseText);
      }
    }
  }
}

function Buttons(fieldId) {
  this.field = document.querySelector('#' + fieldId);
}

GameField.prototype.start = function () {
  this.getJSONData('https://kde.link/test/get_field_size.php', function (data) {
    var data = JSON.parse(data);
    this._makeCards(data.width, data.height);
  }.bind(this))
  return this
}

GameField.prototype._makeCards = function (width, height) {
  var set = this._addImages(width, height);
  var n = 0;
  range(height).forEach(function (j) {
    range(width).forEach(function (i) {
      var div = document.createElement('div');
      var img = document.createElement('IMG');
      img.src = this.PICTURE_URLS[set[n]];
      img.setAttribute('data-active', '')
      n += 1;
      var divWidth
      if (width >= height) {
        divWidth = Math.floor((this.field.clientWidth - 20) / width);
      } else {
        divWidth = Math.floor((this.field.clientWidth - 20) / height);
      }
      div.style.width = divWidth + 'px';
      div.style.height = div.style.width;
      this.field.style.height = (divWidth * height + 25) + 'px';
      div.className = 'cards';
      div.appendChild(img);
      this.field.appendChild(div);
    }.bind(this))
  }.bind(this))
  var text = document.querySelectorAll('h4')[1];
  this.cardsNum = document.querySelectorAll('img').length
  text.innerHTML = 'Remain: ' + this.cardsNum;
}

GameField.prototype.addEvent = function (eventName, func) {
  document.body.addEventListener(eventName, func.bind(this));
  return this;
}

GameField.prototype.mouseEvents = function (event) {
  var target = event.target;
  var text = document.querySelectorAll('h4')[1];
  while (target && target !== document.body) {
    if (target && target.className == 'cards') {
      if (this.activeCount === 2) {
        Array.prototype.forEach.call(document.querySelectorAll('.cards'), function (node) {
          if (!node.childNodes[0].hasAttribute('data-active')) {
            node.childNodes[0].setAttribute('data-active', '');
          }
        })

        this.activeCount = 0;
      }
      if (this.lastTarget &&
        target.childNodes[0].src === this.lastTarget.childNodes[0].src &&
        target.childNodes[0] !== this.lastTarget.childNodes[0] &&
        !this.lastTarget.hasAttribute('data-active')) {
        target.setAttribute('data-active', '');
        this.lastTarget.setAttribute('data-active', '');
        this.cardsNum -= 2;
        text.innerHTML = 'Remain: ' + this.cardsNum;
        if (this.cardsNum === 0) {
          this.clearField();
          this.gameOver('won');
        }
        console.log(this.cardsNum);
      }
      target.childNodes[0].removeAttribute('data-active');
      this.activeCount += 1;
      this.lastTarget = target;
      return;
    }
    target = target.parentNode;
  }
}



GameField.prototype._addImages = function (width, height) {
  var fullNum = width * height;
  var set = this.PICTURE_URLS.length;
  if (fullNum < set * 2) {
    set = fullNum / 2;
  } else {
    while (fullNum % set !== 0 || (fullNum / set) % 2 !== 0) {
      set -= 1;
    }
  }
  var times = width * height / set;
  var resultSet = [];
  range(times).forEach(function (i) {
    resultSet = resultSet.concat(range(set).sort(function () {
      return Math.random() - 0.5;
    }))
  })
  resultSet = resultSet.sort(function () {
    return Math.random() - 0.5;
  });
  return resultSet;
}

GameField.prototype.clearField = function () {
  var field = document.querySelector('#' + this.field.id)
  var childs = field.children.length;
  range(childs).forEach(function (i) {
    field.removeChild(field.children[field.children.length - 1]);
  }.bind(this));
  return this;
}

GameField.prototype.counter = function () {
  var n = 100;
  var element = document.querySelectorAll('h4')[0];
  var test = function () {
    this.clearField();
    this.gameOver('lost');
  }

  function timer() {
    setTimeout(function t() {
      var that = this;
      element.innerHTML = 'Count: ' + n;
      n -= 1;
      if (n < 0) {
        test.bind(this)();
        return
      }
      if (this.cardsNum === 0) {
        return;
      }
      timer.bind(that)();
    }.bind(this), 1000);
  };
  timer.bind(this)();
  return this;
}

GameField.prototype.gameOver = function (status) {
  var textWrap = document.createElement('div');
  textWrap.className = 'text-wrap';
  if (status === 'lost') {
    var text = document.createElement('h1');
    var text2 = document.createElement('h2');
    text.innerHTML = 'Game Over';
    text2.innerHTML = 'You lost!';
    textWrap.appendChild(text);
    textWrap.appendChild(text2);
  } else {
    var text = document.createElement('h3');
    text.innerHTML = 'You Won!';
    textWrap.appendChild(text);
  }
  var butts = new Buttons('field');
  this.field.appendChild(textWrap);
  butts.createButton('AGAIN?').addEvent('click', function () {
    gameField.clearField().start().addEvent('click', gameField.mouseEvents).counter();
  });
}

Buttons.prototype.addEvent = function (eventName, func) {
  this.button.addEventListener(eventName, func);
  return this;
}

Buttons.prototype.createButton = function (name) {
  var button = document.createElement('button');
  button.innerHTML = name;
  button.className = 'button';
  this.button = button;
  this.field.appendChild(button);
  return this;
}

var gameField = new GameField('field');
var buttons = new Buttons('field');
buttons.createButton('START').addEvent('click', function () {
  gameField.clearField().start().addEvent('click', gameField.mouseEvents).counter();
});
// gameField.start().addEvent('click', gameField.mouseEvents);
