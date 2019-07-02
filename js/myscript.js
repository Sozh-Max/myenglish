window.onload = function() {
	class FrontEndClass {
		constructor () {
			this.settings = {};
			this.downloadJson();
			this.events();
		}

		events() {
			document.addEventListener('change', function(e) {
				var elem = e.target;
				if (elem.hasAttribute('data-event-change')) {
					var collection = elem.getAttribute('data-event-change').split(' ');
					collection.forEach(function(item) {
						window.FrontEnd[item](elem, e)
					})
				}
			});
			document.addEventListener('click', function(e) {
				var elem = e.target;
				if (elem.hasAttribute('data-event-click')) {
					var collection = elem.getAttribute('data-event-click').split(' ');
					collection.forEach(function(item) {
						window.FrontEnd[item](elem, e)
					})
				}
			});
		}

		downloadJson() {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', './json/words.json', true);
			xhr.onload = function (e) {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						window.FrontEnd.dataBase = JSON.parse(xhr.responseText);
						window.FrontEnd.sortUsers();
					} else {
						console.error(xhr.statusText);
					}
				}
			};
			xhr.onerror = function (e) {
				console.error(xhr.statusText);
			};
			xhr.send(null);
		}

		sortUsers() {
			this.settings.usersName = [];
			for (var prop in  window.FrontEnd.dataBase) {
				this.settings.usersName.push(prop);
			}
			this.viewUsers();
		}

		viewUsers() {
			var userContain = document.getElementById('user_contain');
			var div = document.createElement('div');
			div.classList.add('user_select_contain');
			div.innerHTML = '<div class="user_title">Select User</div>';
			var select = document.createElement('select');
			select.innerHTML = '<option value="" disabled selected hidden>Select User</option>';
			this.settings.usersName.forEach(function(item) {
				var option = document.createElement('option');
				option.text = item;
				option.value = item;
				select.appendChild(option);
			});
			select.classList.add('select_user');
			select.setAttribute('data-event-change', 'userSelected')
			div.appendChild(select);
			userContain.appendChild(div);
		}

		viewUserGroups() {
			var userContain = document.getElementById('user_contain');
			var user = window.FrontEnd.settings.activeUser;
			var base = window.FrontEnd.dataBase[user];
			var groupsName = [];
			var div = document.createElement('div');
			div.setAttribute('id', 'user_group_contain');
			div.classList.add('user_select_contain');
			div.innerHTML = '<div class="group_title">Select Group</div>';
			var select = document.createElement('select');
			select.innerHTML = `
				<option value="" disabled selected hidden>Select Group</option>
				<option value="reserved-allgroups">All Groups</option>
			`;
			for (var item in base) {
				groupsName.push(item);
			}
			groupsName.forEach(function(item) {
				var option = document.createElement('option');
				option.text = item;
				option.value = item;
				select.appendChild(option);
			});
			select.classList.add('select_group');
			select.setAttribute('data-event-change', 'groupSelected')
			div.appendChild(select);
			userContain.appendChild(div);
		}

		viewUserEvents() {
			var userContain = document.getElementById('user_contain');
			var div = document.createElement('div');
			div.classList.add('user_select_contain');
			div.setAttribute('id', 'user_event_contain');
			div.innerHTML = `
				<div class="event_title">Select Event</div>
				<select class="select_event" data-event-change="eventSelected">
					<option value="" disabled selected hidden>Select Event</option>
					<option value="game">Game</option>
					<option value="show">View Card</option>
				</select>
			`;
			userContain.appendChild(div);
		}

		viewBtnConfirm() {
			var userContain = document.getElementById('user_contain');
			var div = document.createElement('div');
			div.classList.add('user_select_contain');
			div.setAttribute('id', 'user_confirm_contain');
			div.innerHTML = `
				<div class="event_title">Confirm your choice</div>
				<div><button class="btn_confirm" data-event-click="confirmChoice">Confirm</button></div>
			`;
			userContain.appendChild(div);
		}

		userSelected(elem) {
			if (document.getElementById('user_event_contain')) {
				document.getElementById('user_event_contain').remove();
			}
			if (document.getElementById('user_group_contain')) {
				document.getElementById('user_group_contain').remove();
			}
			if (document.getElementById('user_confirm_contain')) {
				document.getElementById('user_confirm_contain').remove();
			}
			window.FrontEnd.settings.activeUser = elem.value;
			this.viewUserEvents();
		}

		eventSelected() {
			if (document.getElementById('user_group_contain')) {
				document.getElementById('user_group_contain').remove();
			}
			if (document.getElementById('user_confirm_contain')) {
				document.getElementById('user_confirm_contain').remove();
			}
			this.viewUserGroups();
		}

		groupSelected() {
			if (document.getElementById('user_confirm_contain')) {
				document.getElementById('user_confirm_contain').remove();
			}
			this.viewBtnConfirm();
		}

		chooseTheme(elem) {
			var colorTheme = elem.getAttribute('data-theme');
			document.querySelector('body').setAttribute('data-theme', colorTheme)
		}

		confirmChoice() {
			this.settings.eventName = document.querySelector('.select_event').value;
			this.settings.groupName = document.querySelector('.select_group').value;
			this.settings.currentCard = this.currentCardFill();
			this[this.settings.eventName + 'TaskCreate']();
		}

		currentCardFill() {
			if (this.settings.groupName === 'reserved-allgroups') {
				var result = [];
				var dataFull = window.FrontEnd.dataBase[this.settings.activeUser];
				for (var item in dataFull) {
					dataFull[item].forEach(function(item) {
						result.push(item);
					});
				}
				return result;
			} else {
				return window.FrontEnd.dataBase[this.settings.activeUser][this.settings.groupName];
			}
		}

		showTaskCreate() {
			var container = document.getElementById('main');
			container.innerHTML = '';
			var div = document.createElement('section');
			div.classList.add('card_list_section');
			div.innerHTML = `
				<div class="container">
					<div class="card_list_contain" id="container_cards"></div>
				</div>
			`;
			container.appendChild(div);
			var containCard = document.getElementById('container_cards');
			containCard.innerHTML = this.showTaskCreateFill();
		}

		showTaskCreateFill() {
			var result = ``;
			this.settings.currentCard.forEach(function(item) {
				result += `
				<div class="card_block">
					<div class="card_img">
						<img src="img/words/${item.word.toLowerCase()}.jpg" alt="">
					</div>
					<div class="card_context">
						<div class="card_title">${item.word}</div>
						<div class="card_transcription">${item.transcription}</div>
					</div>
				</div>
				`;
			})
			return result;
		}

		gameTaskCreate() {
			var container = document.getElementById('main');
			container.innerHTML = '';
			var div = document.createElement('section');
			div.classList.add('card_quest_section');
			div.innerHTML = `
				<div class="container">
					<div class="card_quest_contain" id="container_cards"></div>
				</div>
			`;
			container.appendChild(div);
			var containCard = document.getElementById('container_cards');
			containCard.innerHTML = this.gameTaskCreateFill();
			document.querySelector('.card_block[data-index="0"]').classList.add('active');
		}

		gameTaskCreateFill() {
			var result = ``;
			var length = this.settings.currentCard.length;
			var sortArray = this.sortingArray(length);
			this.settings.currentCard.forEach(function(item, i) {
				result += `
				<div class="card_block card_blosk_game" data-index="${sortArray[i]}" data-answer="${item.word}">
					<div class="card_img">
						<img src="img/words/${item.word.toLowerCase()}.jpg" alt="">
					</div>
					<div class="card_context">
						<div class="card_answer">
							<div class="answer_title">Enter word</div>
							<div class="answer_input_contain">
								<input type="text" class="answer_input">
							</div>
							<div class="answer_input_contain">
								<button class="btn_answer" data-event-click="checkResult">Apply</button>
							</div>
						</div>
						<div class="card_result_contain"></div>
					</div>
				</div>
				`;
			})
			return result;
		}

		checkResult(elem) {
			var result = false;
			var card = this.findParent(elem, 'card_block');
			var trueResult = card.getAttribute('data-answer');
			var myResult = card.querySelector('.answer_input').value;
			if (!myResult) {
				alert('Enter word to INPUT');
				return false;
			}
			if (myResult.toLowerCase() === trueResult.toLowerCase()) {
				result = true;
			}
			this.viewResult(card, result, trueResult);
		}

		viewResult(card, result, trueResult) {
			var containResult = card.querySelector('.card_result_contain');
			if (result) {
				containResult.innerHTML = `
				<div class="answer_result">Succesfull</div>
				<div>
					<button class="btn_next" data-event-click="nextCardShow">Next Card</button>
				</div>
				`;
			} else {
				containResult.innerHTML = `
				<div class="answer_result">The answer is not correct. The correct answer is <span>${trueResult}</span></div>
				<div>
					<button class="btn_next" data-event-click="nextCardShow">Next Card</button>
				</div>
				`;
			}
			card.querySelector('.card_answer').remove();
		}

		nextCardShow(elem) {
			var card = this.findParent(elem, 'card_block');
			var cardValue = parseInt(card.getAttribute('data-index'));
			card.classList.remove('active');
			if (document.querySelector('.card_block[data-index="' + (cardValue + 1) + '"]')) {
				document.querySelector('.card_block[data-index="' + (cardValue + 1) + '"]').classList.add('active');
			} else {
				document.getElementById('container_cards').innerHTML = `
					<div class="card_cancel">Cancel</div>
				`;
			}
		}

		findParent(el, cls) {
			while ((el = el.parentElement) && !el.classList.contains(cls));
			return el;
		}

		sortingArray(length) {
			var array = [];
			for(var i = 0; i < length; i++){
				array.push(i); 
			}
			array.sort(this.compareRandom);
			return array;
		}
		
		compareRandom(a, b) {
			return Math.random() - 0.5;
		}

	}

	window.FrontEnd = new FrontEndClass();
}