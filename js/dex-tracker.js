'use strict';

const cantTransfer = [
	'pikachu-cosplay',
	'pikachu-rockstar',
	'pikachu-belle',
	'pikachu-popstar',
	'pikachu-phd',
	'pikachu-libre',
	'pikachu-original',
	'pikachu-hoenn',
	'pikachu-sinnoh',
	'pikachu-unova',
	'pikachu-kalos',
	'pikachu-alola',
	'pikachu-partner',
	'pikachu-world',
	'kyurem-black',
	'kyurem-white',
	'terapagos-terastal'
];
const notInAnySwitchGame = [
	'pikachu-cosplay',
	'pikachu-rockstar',
	'pikachu-belle',
	'pikachu-popstar',
	'pikachu-phd',
	'pikachu-libre',
	'pikachu-original',
	'pikachu-hoenn',
	'pikachu-sinnoh',
	'pikachu-unova',
	'pikachu-kalos',
	'pikachu-alola',
	'pikachu-partner',
	'pikachu-world',
	'celebi',
	'deoxys',
	'deoxys-attack',
	'deoxys-defense',
	'deoxys-speed',
	'victini',
	'genesect',
	'hoopa',
	'hoopa-unbound',
	'volcanion',
	'magearna',
	'magearna-original',
	'marshadow',
	'zarude',
	'zarude-dada'
];
const gameNames = {
	"go": "Pokemon GO",
	"home": "Pokemon HOME Gift/Event",
	"lg-pikachu": "Let's Go Pikachu",
	"lg-eevee": "Let's Go Eevee",
	"sword": "Sword",
	"shield": "Shield",
	"sword-armor": "Isle of Armor (Sword)",
	"shield-armor": "Isle of Armor (Shield)",
	"sword-crown": "Crown Tundra (Sword)",
	"shield-crown": "Crown Tundra (Shield)",
	"bdiamond": "Brilliant Diamond",
	"spearl": "Shining Pearl",
	"pla": "Legends Arceus",
	"scarlet": "Scarlet",
	"violet": "Violet",
	"scarlet-mask": "The Teal Mask (Scarlet)",
	"violet-mask": "The Teal Mask (Violet)",
	"scarlet-disc": "The Indigo Disc (Scarlet)",
	"violet-disc": "The Indigo Disc (Violet)",
	"za": "Legends Z-A",
	"za-megadim": "Mega Dimension"
};
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
	document.getElementById('speciesSearchBar').value = "";

	document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
		checkbox.addEventListener('click', saveCheckboxes);
	})

	document.querySelectorAll('.toggleCollapse').forEach(collapseBtn => {
		collapseBtn.addEventListener('click', function() {
			collapseBtn.classList.toggle('active');
			let togglesToCollapse = gameToggles;
			if (collapseBtn.id === 'formToggleCollapse')
				togglesToCollapse = formToggles;

			if (collapseBtn.classList.contains('active')) {
				collapseBtn.innerHTML = 'v';
				togglesToCollapse.style.width = (togglesToCollapse.getBoundingClientRect().width - 30) + 'px';
				togglesToCollapse.style.height = 'fit-content';
				for (let i = 0; i < togglesToCollapse.children.length; i++)
				{
					let toggle = togglesToCollapse.children[i];
					if (i > 1)
					{
						toggle.style.display = "none";
					}
				}
			}
			else {
				collapseBtn.innerHTML = '^';
				togglesToCollapse.style.width = 'auto';
				togglesToCollapse.style.height = 'auto';
				for (let i = 0; i < togglesToCollapse.children.length; i++)
				{
					let toggle = togglesToCollapse.children[i];
					if (i > 1)
					{
						toggle.style.display = "block";
					}
				}
			}
		})
	})

	document.getElementById('speciesSearchBar').addEventListener('input', function() {
		let searchedSpecies = document.getElementById('speciesSearchBar').value;
		searchedSpecies = searchedSpecies.toLowerCase().replace(" ", "-");
		let outputField = document.getElementById('speciesSearchResults');
		outputField.innerHTML = "";

		if (searchedSpecies.length < 2)
			return;

		// Replace invalid - with nothing if needed
		if (searchedSpecies.endsWith('-'))
			searchedSpecies = searchedSpecies.replace('-', '');

		// Female variants aren't listed since they're in all the same games as the male ones
		if (searchedSpecies.endsWith('-f'))
			searchedSpecies = searchedSpecies.replace('-f', '');

		fetch("data/availability.json")
			.then(response => response.json())
			.then(data => {
				for (let species in data) {
					if (species.includes(searchedSpecies)) {
						let speciesGames = data[species];
						outputField.innerHTML += `<strong>${species}:</strong><ul>`;
						if (speciesGames.length === 0) {
							outputField.innerHTML += `<li>This Pokemon is not obtainable in any Switch-era game</li>`;
						}
						for (let game of speciesGames) {
							let text = "";
							if (game.includes('*')) {
								text = gameNames[game.replace('*', '')] + " w/ external communication";
							}
							if (game.includes('+')) {
								let games = game.split('+');

								for (let i in games) {
									text += gameNames[games[i]];

									if (i === "0") {
										text += " w/ save data from "
									} else if (i < games.length - 1) {
										text += "/"
									}
								}
							}
							if (text === "") {
								text = gameNames[game];
							}
							outputField.innerHTML += `<li>${text}</li>`;
						}
						outputField.innerHTML += "</ul><br/>";
					}
				}
			})
	})

	document.getElementById('exportBtn').addEventListener('click', function() {
		let json = {};
		for (let storedElement in localStorage) {
			json[storedElement] = localStorage[storedElement];
		}
		let file = new File([JSON.stringify(json)], "pokedex-tracker-data.json", {type: 'application/octet-stream'});
		let url = URL.createObjectURL(file);
		window.open(url);
		URL.revokeObjectURL(url);
	})

	document.getElementById('importBtn').addEventListener('click', function() {
		let importFile = document.getElementById('importFile');
		importFile.click();
	})
})

function importSaveData() {
	let importFile = document.getElementById('importFile');
	let url = URL.createObjectURL(importFile.files[0]);
	fetch(url)
		.then(res => res.json())
		.then(data => {
			for (let item in data) {
				let itemJson = JSON.parse(data[item]);
				if (itemJson instanceof Object) {
					localStorage.setItem(item, data[item]);
				}
			}
			refreshBoxes();
		})
}

function refreshBoxes() {
	fetch('data/species.txt')
		.then(res => res.text())
		.then(speciesData => {
			fetch('data/availability.json')
				.then(res => res.json())
				.then(speciesAvailData => {
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
							let newMon = document.createElement('button');
							newMon.classList.add('pkmn');

							// Update the per-species static formatting
							let tip = tryGetTooltip(line);
							if (cantTransfer.includes(line))
								newMon.classList.add('no-transfer');
							else if (tip !== null) {
								newMon.classList.add('has-diff-factor');
								newMon.title = tip;
							}
							if (line === 'gimmighoul-roaming' || line === 'meltan' || line === 'melmetal')
								newMon.classList.add('go-only');
							let convertedForm = convertInvalidSpecies(speciesAvailData, line);
							let isAvailable = false;
							for (let game of speciesAvailData[convertedForm]) {
								// Skip GO and HOME stuff since we don't have toggles for those
								if (game === 'go' || game === 'home')
									continue;

								// Skip games that require external communication (i.e, trade evos, Union Circle, and Snacksworth quests)
								// if the toggle to allow trade evos is unchecked
								if (game.includes('*') && !document.getElementById('trade').checked)
									continue;

								game = game.replace('*', '');

								// Some games require save data from another- namely Gmax Pikachu/Eevee in Swo/Shi and Mew and Jirachi in BD/SP
								// These are another special case that needs to be accounted for
								if (game.includes('+')) {
									let games = game.split('+');
									let gameCount = 0;

									for (let neededGame of games) {
										if (document.getElementById(neededGame).checked)
											gameCount++;
									}

									if (gameCount >= games.length)
										isAvailable = true;

									continue;
								}

								// Since we went through all the special cases, now we can just check which game we were given
								if (document.getElementById(game).checked)
									isAvailable = true;
							}
							if (!isAvailable)
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

							let silToggle = document.getElementById('silhouetteToggle');
							if (!newMon.classList.contains('seen') && !newMon.classList.contains('caught') && silToggle.checked) {
								newMon.innerHTML = `<img class="unseen" src="${url}" alt="${line}" />`;
							}
							else {
								newMon.innerHTML = `<img src="${url}" alt="${line}" />`;
							}

							newMon.dataset.name = line;
							newMon.addEventListener("click", clickMon);
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
							// Don't do this if we're on the last Pokemon (Pecharunt)
							if (i >= 30 && line !== 'pecharunt')
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
		})
}

// This function is needed to make sure that each Pokemon species slot checks the corresponding species
function convertInvalidSpecies(data, species) {
	// Obviously, if the species is already listed, we don't need to do anything
	if (data.hasOwnProperty(species)) {
		return species;
	}

	// Any female variant of a species should map to its default/male counterpart
	if (species.endsWith('-f'))
		return species.replace('-f', '');

	// Some forms are shared across many species, so it's probably easier to just remove those
	const FORMS_TO_REMOVE = [
		"-therian",
		"-antique",
		"-artisan",
		"-masterpiece",
		"-crowned"
	]

	for (let item of FORMS_TO_REMOVE) {
		if (species.includes(item)) {
			return species.replace(item, "");
		}
	}

	// Some species have a LOT of forms, and those ones are easy to just map to their default one
	const MAP_TO_DEFAULT = [
		"pikachu",
		"unown",
		"castform",
		"deoxys",
		"burmy",
		"wormadam",
		"cherrim",
		"shellos",
		"gastrodon",
		"rotom",
		"shaymin",
		"arceus",
		"basculin",
		"deerling",
		"sawsbuck",
		"kyurem",
		"keldeo",
		"meloetta",
		"genesect",
		"greninja",
		"vivillon",
		"flabebe",
		"floette",
		"florges",
		"furfrou",
		"aegislash",
		"pumpkaboo",
		"gourgeist",
		"hoopa",
		"oricorio",
		"lycanroc",
		"minior",
		"silvally",
		"necrozma",
		"magearna",
		"toxtricity",
		"alcremie",
		"calyrex",
		"maushold",
		"squawkabilly",
		"dudunsparce",
		"ogerpon",
		"terapagos"
	];

	// Tatsugiri is a slightly special case, as it needs to account for its mega form since that has three variants for some reason
	if (species.includes('tatsugiri')) {
		if (species.includes('mega')) {
			return 'tatsugiri-mega';
		}
		return 'tatsugiri';
	}

	// Urshifu is similar to Tatsugiri, except it has a gmax form instead of mega
	if (species.includes('urshifu')) {
		if (species.includes('gmax')) {
			return 'urshifu-gmax';
		}
		return 'urshifu';
	}

	for (let item of MAP_TO_DEFAULT) {
		if (species.includes(item)) {
			return item;
		}
	}
}

const SPECIES_TOOLTIPS = {
	'charizard-megax': "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A with any damaging Dragon-type move",
	'raichu-megax': "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A with any physical Electric-type move",
	'raichu-megay': "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A with any special Electric-type move",
	'mewtwo-megax': "Can be differentiated by being transferred in from Legends Z-A or LGPE with any damaging Fighting-type move",
	'mewtwo-megay': "Can be differentiated by being transferred in from Legends Z-A or LGPE with the move Agility",
	'castform-sunny': "Can be differentiated with the move Sunny Day or any damaging Fire-type move",
	'castform-rainy': "Can be differentiated with the move Rain Dance or any damaging Water-type move",
	'castform-snowy': "Can be differentiated with the move Blizzard/Snowscape or any damaging Ice-type move",
	'absol-megaz': "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A with any damaging Ghost-type move",
	'groudon-primal': "Can be differentiated by being transferred in from Legends Z-A with the move Precipice Blades",
	'kyogre-primal': "Can be differentiated by being transferred in from Legends Z-A with the move Origin Pulse",
	'latios-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Luster Purge",
	'latias-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Mist Ball",
	'rayquaza-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Dragon Ascent",
	'cherrim-sunshine': "Can be differentiated with the move Sunny Day",
	'lucario-megaz': "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A with only special attacks",
	'dialga-origin': "Can be differentiated by being transferred in from Legends Arceus with the move Roar of Time",
	'palkia-origin': "Can be differentiated by being transferred in from Legends Arceus with the move Spacial Rend",
	'giratina-origin': "Can be differentiated by being transferred in from Legends Arceus with the move Shadow Force",
	'heatran-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Magma Storm",
	'darkrai-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Dark Void",
	'darmanitan-zen': "Can be differentiated with the Zen Mode ability",
	'darmanitan-galarzen': "Can be differentiated with the Zen Mode ability",
	'meloetta-pirouette': "Can be differentiated with the move Relic Song",
	'keldeo-resolute': "Can be differentiated with the move Secret Sword",
	'genesect-shock': "Can be differentiated with any damaging Electric-type move",
	'genesect-burn': "Can be differentiated with any damaging Fire-type move",
	'genesect-chill': "Can be differentiated with any damaging Ice-type move",
	'genesect-douse': "Can be differentiated with any damaging Water-type move",
	'greninja-ash': "Can be differentiated with the Battle Bond ability",
	'aegislash-blade': "Can be differentiated with the lack of the move King's Shield",
	'zygarde-complete': "Can be differentiated with the Power Construct ability",
	'zygarde-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Core Enforcer",
	'diancie-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Diamond Storm",
	'necrozma-dawnwings': "Can be differentiated with any damaging Ghost-type move",
	'necrozma-duskmane': "Can be differentiated with any damaging Steel-type move",
	'necrozma-ultra': "Can be differentiated with any damaging Dragon-type move",
	'zeraora-mega': "Can be differentiated by being transferred in from Legends Z-A with the move Plasma Fists",
	'zacian-crowned': "Can be differentiated with the move Iron Head",
	'zamazenta-crowned': "Can be differentiated with the move Iron Head",
	'calyrex-shadow': "Can be differentiated with any damaging Ghost-type move",
	'calyrex-ice': "Can be differentiated with any damaging Ice-type move",
	'ogerpon-wellspring': "Can be differentiated with any damaging Water-type move",
	'ogerpon-hearthflame': "Can be differentiated with any damaging Fire-type move",
	'ogerpon-cornerstone': "Can be differentiated with any damaging Rock-type move",
	'terapagos-stellar': "Can be differentiated with the move Tera Starstorm"
}

function tryGetTooltip(species)
{
	// Prioritize unique tooltips over the general ones for megas/gmax forms
	// This currently only matters for Mega Rayquaza, as it's the only one with a unique differentiating factor
	if (SPECIES_TOOLTIPS.hasOwnProperty(species)) {
		return SPECIES_TOOLTIPS[species];
	}

	if (species.includes("-mega") || (species.includes('tatsugiri') && species.includes('mega'))) {
		return "Can be differentiated by being an Alpha Pokemon transferred in from Legends Z-A";
	}

	if (species.includes("arceus-") || species.includes("silvally-")) {
		return "Can be differentiated with any damaging move of the corresponding type";
	}

	if (species.includes("gmax")) {
		return "Can be differentiated with the Gigantamax Factor";
	}

	return null;
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
			if (pkmn.innerHTML.includes("Box"))
				continue;

			total++;

			if (pkmn.classList.contains('seen'))
				seen++;
			if (pkmn.classList.contains('caught'))
				caught++;
		}
	}

	let caughtPercent = (caught / total) * 100;
	document.getElementById('dexProgress-caught').style.width = `${caughtPercent}%`;
	if (caught > 0)
		document.getElementById('dexProgress-caught').innerHTML = `${caught}`;
	else
		document.getElementById('dexProgress-caught').innerHTML = '';

	let seenPercent = (seen / total) * 100;
	document.getElementById('dexProgress-seen').style.width = `${seenPercent}%`;
	if (seen > 0)
		document.getElementById('dexProgress-seen').innerHTML = `${seen}`;
	else
		document.getElementById('dexProgress-seen').innerHTML = '';

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
        updatePage(name, classList.contains('seen'), classList.contains('caught'));
		return;
	}

	classList.toggle('seen');
    updatePage(name, classList.contains('seen'), classList.contains('caught'));
}

function updatePage(name, seen, caught) {
    updateProgressBar();
    updateSaveData(name, seen, caught);
    refreshBoxes();
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

const ZA_MEGAS = [
	"clefable-mega",
	"victreebel-mega",
	"starmie-mega",
	"dragonite-mega",
	"meganium-mega",
	"feraligatr-mega",
	"skarmory-mega",
	"froslass-mega",
	"emboar-mega",
	"excadrill-mega",
	"scolipede-mega",
	"scrafty-mega",
	"eelektross-mega",
	"chandelure-mega",
	"chesnaught-mega",
	"delphox-mega",
	"greninja-mega",
	"pyroar-mega",
	"floette-mega",
	"malamar-mega",
	"barbaracle-mega",
	"dragalge-mega",
	"hawlucha-mega",
	"zygarde-mega",
	"drampa-mega",
	"falinks-mega"
];
const MEGA_DIM_MEGAS = [
	"raichu-megax",
	"raichu-megay",
	"chimecho-mega",
	"absol-megaz",
	"staraptor-mega",
	"lucario-megaz",
	"heatran-mega",
	"darkrai-mega",
	"golurk-mega",
	"meowstic-mega",
	"crabominable-mega",
	"golisopod-mega",
	"zeraora-mega",
	"scovillain-mega",
	"glimmora-mega",
	"tatsugiri-mega",
	"tatsugiri-droopymega",
	"tatsugiri-stretchymega",
	"baxcalibur-mega"
];

function checkForm(species)
{
	// Automatically return true if this is not a form of any Pokemon
	if (isDefaultForm(species))
		return true;

	// Darmanitan's Zen forms
	if (species.endsWith('zen'))
		return document.getElementById('zenToggle').checked;

	// Gender variants (w/ failsafe for female megas and regionals)
	if (species.endsWith('-f') && !species.includes('unown')) {
		if (species.includes('-mega')) {
			return document.getElementById('megaToggle').checked &&
				document.getElementById('genderToggle').checked;
		}
		if (species.includes('-alola') || species.includes('-galar') ||
			species.includes('-hisui') || species.includes('-paldea')) {
			return document.getElementById('regionalToggle').checked &&
				document.getElementById('genderToggle').checked;
		}

		return document.getElementById('genderToggle').checked;
	}

	// Regional forms (has to ignore Pikachu because of the hat forms' naming conventions matching regional forms)
	if (!species.includes('pikachu'))
		if (species.includes('-alola') || species.includes('-galar') ||
			species.includes('-hisui') || species.includes('-paldea'))
			return document.getElementById('regionalToggle').checked;

	// Mega Evolutions (w/ failsafe for Mega Floette and Mega Zygarde)
	if (species.includes('-mega') || (species.includes('tatsugiri') && species.includes('mega'))) {
		if (species === 'floette-mega')
			return document.getElementById('azFloetteToggle').checked &&
				document.getElementById('zaMegasToggle').checked;
		if (species === 'zygarde-mega')
			return document.getElementById('zygardeToggle').checked &&
				document.getElementById('zaMegasToggle').checked;
		// Any megas from Legends Z-A or Mega Dimension have their own checks
		if (ZA_MEGAS.includes(species))
			return document.getElementById('zaMegasToggle').checked;
		if (MEGA_DIM_MEGAS.includes(species)) {
			// Tatsugiri's droopy and stretchy mega forms should be excluded if Tatsugiri's forms are toggled off
			if (species.includes('tatsugiri') && !species.includes('-mega')) {
				return document.getElementById('megaDimMegasToggle').checked &&
					document.getElementById('tatsuToggle').checked;
			}
			return document.getElementById('megaDimMegasToggle').checked;
		}
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
	if (species.includes('-antique') || species.includes('-artisan') || species.includes('-masterpiece') ||
		species.includes('maushold') || species.includes('dudunsparce'))
		return document.getElementById('rareFormToggle').checked;
	if (species.includes('alcremie'))
		return document.getElementById('alcremieToggle').checked;
	if (species.includes('urshifu'))
		return document.getElementById('urshifuToggle').checked;
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
	if (species.includes('basculin'))
		return document.getElementById('basculinToggle').checked;
	if (species.includes('toxtricity'))
		return document.getElementById('toxtricityToggle').checked;

	// Fusions
	if (species.includes('kyurem') || species.includes('necrozma') || species.includes('calyrex')) {
		if (species === 'necrozma-ultra') // Special case
			return document.getElementById('battleFormToggle').checked;
		return document.getElementById('fusionToggle').checked;
	}

	// Event-exclusive forms (Magearna, Zarude)
	if (species.includes('magearna') || species.includes('zarude'))
		return document.getElementById('eventToggle').checked;

	// Primal and origin forms
	if (species.includes('-primal') || species.includes('-origin'))
		return document.getElementById('originToggle').checked;

	// Transformations triggered by using an item (Shaymin, Hoopa, therian forms)
	if (species.includes('shaymin') || species.includes('hoopa') || species.includes('-therian'))
		return document.getElementById('usedItemFormToggle').checked;

	// Transformations triggered by holding an item (Genesect, Zacian/Zamazenta, and Ogerpon)
	if (species.includes('genesect') || species.includes('-crowned') || species.includes('ogerpon'))
		return document.getElementById('heldItemFormToggle').checked;

	// In-battle transformations (Cherrim, Meloetta, Keldeo, Aegislash, Ash-Greninja)
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