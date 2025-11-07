'use strict';

const cantTransfer = [
	'groudon-primal',
	'kyogre-primal',
	'dialga-origin',
	'palkia-origin',
	'giratina-origin',
	'kyurem-black',
	'kyurem-white',
	'necrozma-dawnwings',
	'necrozma-duskmane',
	'necrozma-ultra',
	'zacian-crowned',
	'zamazenta-crowned',
	'calyrex-shadow',
	'calyrex-ice',
	'ogerpon-wellspring',
	'ogerpon-hearthflame',
	'ogerpon-cornerstone',
	'terapagos-terastal',
	'terapagos-stellar'
];
const cantStoreDirectly = [
	'castform-sunny',
	'castform-rainy',
	'castform-snowy',
	'meloetta-pirouette',
	'darmanitan-zen',
	'darmanitan-galarzen',
	'greninja-ash',
	'zygarde-complete'
];
const notInMyGames = [
	'articuno-galar',
	'zapdos-galar',
	'moltres-galar',
	'huntail',
	'gorebyss',
	'lillipup',
	'herdier',
	'stoutland',
	'darumaka',
	'darmanitan',
	'darmanitan-zen',
	'tirtouga',
	'carracosta',
	'archen',
	'archeops',
	'druddigon',
	'bouffalant',
	'reshiram',
	'kyurem',
	'keldeo',
	'tapukoko',
	'tapulele',
	'tapubulu',
	'tapufini',
	'cosmog',
	'cosmoem',
	'solgaleo',
	'nihilego',
	'buzzwole',
	'pheromosa',
	'xurkitree',
	'celesteela',
	'kartana',
	'guzzlord',
	'necrozma',
	'poipole',
	'naganadel',
	'stakataka',
	'blacephalon',
	'rillaboom-gmax',
	'cinderace-gmax',
	'inteleon-gmax',
	'urshifu',
	'urshifu-gmax',
	'urshifu-rapidstrike',
	'urshifu-rapidstrikegmax',
	'regieleki',
	'regidrago',
	'glastrier',
	'calyrex',
	'koraidon',
	'ragingbolt',
	'gougingfire'
];
const notInAnySwitchGame = [
	'deoxys',
	'deoxys-attack',
	'deoxys-defense',
	'deoxys-speed',
	'victini',
	'genesect',
	'diancie',
	'hoopa',
	'hoopa-unbound',
	'volcanion',
	'magearna',
	'magearna-original',
	'marshadow',
	'zeraora',
	'zarude',
	'zarude-dada'
];
let checkedBoxes = [];
let gameToggles;
let formToggles;

document.addEventListener('DOMContentLoaded', function() {
	const boxesGrid = document.querySelector('#boxes');
	gameToggles = document.getElementById('gameToggles');
	formToggles = document.getElementById('formToggles');
	fetch('data/species.txt')
		.then(res => res.text())
		.then(speciesData => {
			let newBox = document.createElement('div');
			let speciesList = speciesData.toLowerCase().split('\n');
			newBox.classList.add('box');

			let i = 0;
			let j = 0;
			speciesList.forEach(line => {
				line = line.trim();
				let url = `http://play.pokemonshowdown.com/sprites/gen5/${line}.png`;
				if (line.includes('/'))
					url = `http://play.pokemonshowdown.com/sprites/${line}.png`;
				let newMon = document.createElement('div');
				newMon.classList.add('pkmn');

				// Update the per-species static formatting
				if (line.includes("-mega") || cantTransfer.includes(line))
					newMon.classList.add('mega');
				if (line.includes("gmax") || cantStoreDirectly.includes(line))
					newMon.classList.add('gmax');
				if (line === 'gimmighoul-roaming' || line === 'meltan' || line === 'melmetal')
					newMon.classList.add('go-only');
				// TODO: This needs to check what Pokemon are available in what games, which is gonna be painful...
				if (notInMyGames.includes(line))
					newMon.classList.add('not-in-my-games');
				if (notInAnySwitchGame.includes(line))
					newMon.classList.add('not-available');

				// Check if the species is in the save data, if not add it, if it is check whether it was seen or caught
				let savedMon = JSON.parse(localStorage.getItem(line));
				if (savedMon !== null)
				{
					if (savedMon.seen)
						newMon.classList.add('seen');
					if (savedMon.caught)
						newMon.classList.add('caught');
				}
				else
				{
					updateSaveData(line, false, false);
				}

				newMon.innerHTML = `<img src="${url}" alt="${line}" />`;
				newMon.dataset.name = line;
				newMon.addEventListener("click", clickMon);
				newMon.addEventListener("keydown", (e) => {
					if (e.key === "Enter" || e.key === " ") clickMon({ currentTarget: newMon });
				});
				newBox.appendChild(newMon);
				i++;

				// Each box can only hold 30 Pokemon, so after the 30th one we need to start a new box
				if (i >= 30)
				{
					boxesGrid.appendChild(newBox);
					i = 0;
					j++;
					newBox = document.createElement('div');
					newBox.classList.add('box');
				}
			})

			boxesGrid.appendChild(newBox);
			updateProgressBar();
			loadCheckboxes();
		})

	document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('click', saveCheckboxes);
	})
})

function updateProgressBar()
{
	let seen = 0;
	let caught = 0;
	let total = 0;
	const boxesGrid = document.querySelector('#boxes');

	for (let pkmnBox of boxesGrid.children)
	{
		for (let pkmn of pkmnBox.children)
		{
			total++;

			if (pkmn.classList.contains('seen'))
				seen++;
			if (pkmn.classList.contains('caught'))
				caught++;
		}
	}

	const progressBar = document.getElementById('dexProgress');
	progressBar.max = total;
	progressBar.value = seen + caught;
	let percent = (progressBar.value / progressBar.max) * 100;
	document.getElementById('progressLabel').innerHTML = `Pokedex Completion Progress: ${progressBar.value} / ${progressBar.max} (${percent.toFixed(2)}%)`
}

function clickMon(event)
{
	let name = event.currentTarget.dataset.name;
	let classList = event.currentTarget.classList;

	if (classList.contains('seen'))
		classList.toggle('caught');
	else if (classList.contains('caught')) {
		classList.remove('caught');
		updateProgressBar();
		updateSaveData(name, classList.contains('seen'), classList.contains('caught'));
		return;
	}

	classList.toggle('seen');
	updateProgressBar();
	updateSaveData(name, classList.contains('seen'), classList.contains('caught'));
}

function updateSaveData(name, seen, caught)
{
	localStorage.setItem(name, JSON.stringify({seen: seen, caught: caught}));
}

function loadCheckboxes()
{
	let storedCheckBoxes = localStorage.getItem("checkedBoxes");
	checkedBoxes = JSON.parse(storedCheckBoxes).checkedBoxes;
	for (let i = 0; i < gameToggles.children.length; i++)
	{
		let toggle = gameToggles.children[i];
		if (toggle.classList.contains('toggle'))
		{
			let check = toggle.children[0];
			if (checkedBoxes.includes(check.id))
				check.checked = true;
		}
	}

	for (let i = 0; i < formToggles.children.length; i++)
	{
		let toggle = formToggles.children[i];
		if (toggle.classList.contains('toggle'))
		{
			let check = toggle.children[0];
			if (checkedBoxes.includes(check.id))
				check.checked = true;
		}
	}
}

function saveCheckboxes()
{
	console.log('Saving checked boxes...')
	checkedBoxes = [];
	for (let i = 0; i < gameToggles.children.length; i++)
	{
		let toggle = gameToggles.children[i];
		if (toggle.classList.contains('toggle'))
		{
			let check = toggle.children[0];
			if (check.checked)
				checkedBoxes.push(check.id);
		}
	}

	for (let i = 0; i < formToggles.children.length; i++)
	{
		let toggle = formToggles.children[i];
		if (toggle.classList.contains('toggle'))
		{
			let check = toggle.children[0];
			if (check.checked)
				checkedBoxes.push(check.id);
		}
	}
	console.log('Checked boxes saved! New list:')
	console.log(checkedBoxes);
	localStorage.setItem("checkedBoxes", JSON.stringify({checkedBoxes: checkedBoxes}));
}