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
let boxesGrid;

document.addEventListener('DOMContentLoaded', function() {
	boxesGrid = document.getElementById('boxes');
	gameToggles = document.getElementById('gameToggles');
	formToggles = document.getElementById('formToggles');
	loadCheckboxes();
	refreshBoxes();

	document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('click', saveCheckboxes);
	})
})

function refreshBoxes() {
	fetch('data/species.txt')
		.then(res => res.text())
		.then(speciesData => {
			boxesGrid.innerHTML = '';
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
				// Check if this is a form of a Pokemon, and if so, make sure it's not disabled
				// The Pokemon won't be added if checkForm determines that it is disabled
				if (checkForm(line))
				{
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
				}
			})

			boxesGrid.appendChild(newBox);
			updateProgressBar();
		})
}

function updateProgressBar()
{
	let seen = 0;
	let caught = 0;
	let total = 0;

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
	localStorage.setItem("checkedBoxes", JSON.stringify({checkedBoxes: checkedBoxes}));
	refreshBoxes();
}

function checkForm(species)
{
	// Automatically return true if this is not a form of any Pokemon
	if (!species.includes('-'))
		return true;

	// Regional forms (has to ignore Pikachu because of the hat forms' naming conventions matching regional forms)
	if (!species.includes('pikachu'))
		if (species.includes('-alola') || species.includes('-galar') || species.includes('-hisui'))
			return document.getElementById('regionalToggle').checked;

	// Gender variants (w/ failsafe for female megas)
	if (species.endsWith('-f')) {
		if (species.includes('-mega'))
			return document.getElementById('megaToggle').checked &&
				document.getElementById('genderToggle').checked;

		return document.getElementById('genderToggle').checked;
	}

	// Mega Evolutions
	if (species.includes('-mega'))
		return document.getElementById('megaToggle').checked;

	// Gigantamax
	if (species.includes('-gmax'))
		return document.getElementById('gmaxToggle').checked;
	// Hat/Cosplay Pikachus (uses if-else to avoid gmax Pikachu being affected)
	else if (species.includes('pikachu') && species !== 'pikachu-f')
		return document.getElementById('pikaFormToggle').checked;

	// All other species-specific forms
	if (species.includes('castform'))
		return document.getElementById('castformToggle').checked;
	if (species.includes('furfrou'))
		return document.getElementById('furfrouToggle').checked;
	if (species.includes('vivillon'))
		return document.getElementById('vivillonToggle').checked;
	if (species.includes('rotom'))
		return document.getElementById('rotomToggle').checked;
	if (species.includes('terapagos'))
		return document.getElementById('terapagosToggle').checked;
	if (species.includes('unown'))
		return document.getElementById('unownToggle').checked;

	// Fusions
	if (species.includes('kyurem') || species.includes('necrozma') || species.includes('calyrex'))
		return document.getElementById('fusionToggle').checked;

	// Item-based transformations (Arceus, Silvally, primal and origin forms, Zacian/Zamazenta, and Ogerpon)
	if (species.includes('-primal') || species.includes('-origin') ||
		species.includes('arceus') || species.includes('silvally') ||
		species.includes('-crowned') || species.includes('ogerpon'))
		return document.getElementById('itemFormToggle').checked;

	// Automatically returns true for any forms not tied to the toggles
	return true;
}