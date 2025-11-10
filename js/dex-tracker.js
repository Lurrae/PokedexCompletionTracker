'use strict';

const cantTransfer = [
	'groudon-primal',
	'kyogre-primal',
	'cherrim-sunshine',
	'dialga-origin',
	'palkia-origin',
	'giratina-origin',
	'kyurem-black',
	'kyurem-white',
	'keldeo-resolute',
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
	'aegislash-blade',
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
			let speciesNum = 0;
			let newHeader = document.createElement('div');
			newHeader.classList.add('box-header');
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

					// speciesNum only increments for things that aren't a form
					// Usually, anything with a "-" in the name is a form, but some Pokemon (like Unown and Shellos)
					// don't have any non-form variants, so we need to account for those
					if (isDefaultForm(line))
						speciesNum++;

					if (newHeader.innerHTML === "")
						newHeader.innerHTML = `Box ${j+1} (#${String(speciesNum).padStart(4, "0")}-`;

					// Each box can only hold 30 Pokemon, so after the 30th one we need to start a new box
					if (i >= 30)
					{
						boxesGrid.appendChild(newBox);
						i = 0;
						j++;
						newHeader.innerHTML += `#${String(speciesNum).padStart(4, "0")})`;
						newBox.prepend(newHeader);
						newHeader = document.createElement('div');
						newHeader.classList.add('box-header');
						newBox = document.createElement('div');
						newBox.classList.add('box');
					}
				}
			})

			boxesGrid.appendChild(newBox);
			newHeader.innerHTML += `#${String(speciesNum).padStart(4, "0")})`;
			newBox.prepend(newHeader);
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

	let caughtPercent = (caught / total) * 100;
	document.getElementById('dexProgress-caught').style.width = `${caughtPercent}%`;
	document.getElementById('dexProgress-caught').innerHTML = `${caught}`;

	let seenPercent = (seen / total) * 100;
	document.getElementById('dexProgress-seen').style.width = `${seenPercent}%`;
	document.getElementById('dexProgress-seen').innerHTML = `${seen}`;

	let totalPercent = ((seen + caught) / total) * 100;
	document.getElementById('progressLabel').innerHTML = `Pokedex Completion Progress: ${seen + caught} / ${total} (${totalPercent.toFixed(2)}%)`
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
	if (storedCheckBoxes == null)
		return;
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
	if (isDefaultForm(species))
		return true;

	// Regional forms (has to ignore Pikachu because of the hat forms' naming conventions matching regional forms)
	if (!species.includes('pikachu'))
		if (species.includes('-alola') || species.includes('-galar') ||
			species.includes('-hisui') || species.includes('-paldea'))
			return document.getElementById('regionalToggle').checked;

	// Gender variants (w/ failsafe for female megas)
	if (species.endsWith('-f')) {
		if (species.includes('-mega'))
			return document.getElementById('megaToggle').checked &&
				document.getElementById('genderToggle').checked;

		return document.getElementById('genderToggle').checked;
	}

	// Mega Evolutions (w/ failsafe for Mega Floette and Mega Zygarde)
	if (species.includes('-mega')) {
		if (species === 'floette-mega')
			return document.getElementById('azFloetteToggle').checked &&
				document.getElementById('megaToggle').checked;
		if (species === 'zygarde-mega')
			return document.getElementById('zygardeToggle').checked &&
				document.getElementById('megaToggle').checked;
		return document.getElementById('megaToggle').checked;
	}

	// Gigantamax (w/ failsafe for Gmax Urshifu)
	if (species.includes('gmax')) {
		if (species.includes('urshifu-rapid'))
			return document.getElementById('urshifuToggle').checked &&
				document.getElementById('gmaxToggle').checked;
		return document.getElementById('gmaxToggle').checked;
	}
	// Hat/Cosplay Pikachus (uses if-else to avoid gmax Pikachu being affected)
	else if (species.includes('pikachu') && species !== 'pikachu-f')
		return document.getElementById('pikaFormToggle').checked;

	// Therian forms
	if (species.includes('-therian'))
		return document.getElementById('therianToggle').checked;

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
	if (species.includes('deoxys'))
		return document.getElementById('deoxysToggle').checked;
	if (species.includes('flabebe') || species.includes('floette') || species.includes('florges')) {
		if (species === 'floette-eternal') // Special case
			return document.getElementById('azFloetteToggle').checked;
		return document.getElementById('flabebeToggle').checked;
	}
	if (species.includes('pumpkaboo') || species.includes('gourgeist'))
		return document.getElementById('pumpkabooToggle').checked;
	if (species.includes('minior'))
		return document.getElementById('miniorToggle').checked;
	if (species.includes('-antique') || species.includes('-artisan') || species.includes('-masterpiece'))
		return document.getElementById('sinisteaToggle').checked;
	if (species.includes('alcremie'))
		return document.getElementById('alcremieToggle').checked;
	if (species.includes('urshifu'))
		return document.getElementById('urshifuToggle').checked;
	if (species.includes('maushold') || species.includes('dudunsparce'))
		return document.getElementById('mausholdToggle').checked;
	if (species.includes('gimmighoul'))
		return document.getElementById('gimmighoulToggle').checked;
	if (species.includes('terapagos'))
		return document.getElementById('terapagosToggle').checked;
	if (species.includes('arceus') || species.includes('silvally'))
		return document.getElementById('arceusFormToggle').checked;
	if (species.includes('zygarde'))
		return document.getElementById('zygardeToggle').checked;
	if (species.includes('burmy') || species.includes('wormadam'))
		return document.getElementById('burmyToggle').checked;
	if (species.includes('shellos') || species.includes('gastrodon'))
		return document.getElementById('shellosToggle').checked;
	if (species.includes('deerling') || species.includes('sawsbuck'))
		return document.getElementById('deerlingToggle').checked;
	if (species.includes('lycanroc'))
		return document.getElementById('lycanrocToggle').checked;
	if (species.includes('oricorio'))
		return document.getElementById('oricorioToggle').checked;
	if (species.includes('squawkabilly'))
		return document.getElementById('squawkabillyToggle').checked;
	if (species.includes('ursaluna'))
		return document.getElementById('ursalunaToggle').checked;
	if (species.includes('tatsugiri'))
		return document.getElementById('tatsuToggle').checked;

	// Fusions
	if (species.includes('kyurem') || species.includes('necrozma') || species.includes('calyrex')) {
		if (species === 'necrozma-ultra') // Special case
			return document.getElementById('battleFormToggle').checked;
		return document.getElementById('fusionToggle').checked;
	}

	// Event-exclusive forms (Magearna, Zarude)
	if (species.includes('magearna') || species.includes('zarude'))
		return document.getElementById('eventToggle').checked;

	// Item-based transformations (primal and origin forms, Shaymin, Genesect, Hoopa, Zacian/Zamazenta, and Ogerpon)
	if (species.includes('-primal') || species.includes('-origin') ||
		species.includes('genesect') || species.includes('-crowned') ||
		species.includes('ogerpon') || species.includes('shaymin') || species.includes('hoopa'))
		return document.getElementById('itemFormToggle').checked;

	// In-battle transformations (Cherrim, Meloette, Keldeo, Aegislash, Ash-Greninja)
	if (species.includes('cherrim') || species.includes('meloetta') ||
		species.includes('keldeo') || species.includes('aegislash') || species === 'greninja-ash')
		return document.getElementById('battleFormToggle').checked;

	// Automatically returns true for any forms not tied to the toggles
	return true;
}

function isDefaultForm(species)
{
	// Hyphens normally indicate a form, but there are some special cases that we'll have to account for
	if (!species.includes('-'))
		return true;

	// Unown has "-a" as its default form
	if (species === 'unown-a')
		return true;

	// Burmy and Wormadam have "-plant" as their default forms
	if (species === 'burmy-plant' || species === 'wormadam-plant')
		return true;

	// Shellos and Gastrodon have "-east" as their default forms
	if (species === 'shellos-east' || species === 'gastrodon-east')
		return true;

	// Deerling and Sawsbuck have "-spring" as their default forms
	if (species === 'deerling-spring' || species === 'sawsbuck-spring')
		return true;

	// Lycanroc has "-midday" as its default form
	if (species === 'lycanroc-midday')
		return true;

	// Return false for anything else, since it's almost certainly a form
	return false;
}