//#region Keybind Values
const keyboardkeys = {
    LeftControl: "lctrl",
    RightControl: "rctrl",
    LeftShift: "lshift",
    RightShift: "rshift",
    LeftAlt: "lalt",
    RightAlt: "ralt",
    Space: "space",
    Insert: "insert",
    Home: "home",
    Backslash: "backslash",
};
const mousekeys = {
    LeftClick: "mouse1",
    RightClick: "mouse2"
};

const keyTranslationMap = {
    // Control/Shift/Alt
    "ControlLeft": "lctrl",
    "ControlRight": "rctrl",
    "ShiftLeft": "lshift",
    "ShiftRight": "rshift",
    "AltLeft": "lalt",
    "AltRight": "ralt",

    // Special keys
    "Backslash": "backslash",
    "Insert": "insert",
    "Home": "home",
    "PageUp": "pgup",
    "PageDown": "pgdown",
    "Quote": "apostrophe",
    "Equal": "equals",

    // Mouse
    "MouseLeft": "mouse1",
    "MouseRight": "mouse2",
    "MouseMiddle": "mouse3",
    "MouseButton4": "mouse4",
    "MouseButton5": "mouse5",

    // Numpad numbers
    "Numpad0": "np_0",
    "Numpad1": "np_1",
    "Numpad2": "np_2",
    "Numpad3": "np_3",
    "Numpad4": "np_4",
    "Numpad5": "np_5",
    "Numpad6": "np_6",
    "Numpad7": "np_7",
    "Numpad8": "np_8",
    "Numpad9": "np_9",

    //Arrows
    "ArrowUp": "up",
    "ArrowDown": "down",
    "ArrowLeft": "left",
    "ArrowRight": "right",

    // Numpad operators
    "NumpadAdd": "np_add",
    "NumpadSubtract": "np_subtract",
    "NumpadMultiply": "np_multiply",
    "NumpadDivide": "np_divide",
    NumpadDecimal: "np_period"
};

// Function to convert a pressed key into XML string
/**
 * Translates a raw key or mouse code into your internal key string for XML/keybind mapping.
 * Handles letters, digits, modifiers, numpad, and mouse buttons.
 * @param {string} code - e.code or mouse code
 * @returns {string} - translated key string
 */
function translateKey(code)
{
    // direct lookup first
    if (keyTranslationMap[code]) return keyTranslationMap[code];

    // letters A-Z
    const keyMatch = code.match(/^Key([A-Z])$/);
    if (keyMatch) return keyMatch[1];

    // digits 0-9
    const digitMatch = code.match(/^Digit([0-9])$/);
    if (digitMatch) return digitMatch[1];

    // Numpad digits
    const numpadMatch = code.match(/^Numpad([0-9])$/);
    if (numpadMatch) return `np_${ numpadMatch[1] }`;

    // Numpad operators
    const npOpMap = {
        NumpadAdd: "np_add",
        NumpadSubtract: "np_subtract",
        NumpadMultiply: "np_multiply",
        NumpadDivide: "np_divide",
    };
    if (npOpMap[code]) return npOpMap[code];

    // Mouse buttons (0-5)
    const mouseMap = {
        MouseLeft: "mouse1",
        MouseRight: "mouse2",
        MouseMiddle: "mouse3",
        MouseButton4: "mouse4",
        MouseButton5: "mouse5",
    };
    if (mouseMap[code]) return mouseMap[code];

    // Fallback: return raw code
    return code;
}
//#endregion




//#region Dictionaries

let actionMapDictionary = {}


function getActionLabel(key)
{
    return actionMapDictionary[key]?.label || autoFormatMapName(key);
}

function getActionDescription(key)
{
    return actionMapDictionary[key]?.description || key + ": No description available.";
}

function getActionKeywords(key)
{
    return actionMapDictionary[key]?.keywords ?? [];
}

function autoFormatMapName(keybindString)
{
    let output = keybindString;
    output = output
        .replace("v_", "")
        .replaceAll("_", " ")
        .replace(' 3d ', ' 3D ')

    if (output.startsWith("mfd ")) output = "MFD " + output.slice(4);
    if (output.startsWith("ifcs ")) output = "IFCS " + output.slice(5);
    if (output.startsWith("vtol ")) output = "VTOL " + output.slice(5);
    if (output.startsWith("atc ")) output = "ATC " + output.slice(4);
    if (output.startsWith("eva ")) output = "EVA " + output.slice(4);
    if (output.startsWith("ads ")) output = "ADS " + output.slice(4);
    if (output.startsWith("hud ")) output = "HUD " + output.slice(4);
    if (output.startsWith("ui ")) output = "UI " + output.slice(3);
    if (output.startsWith("zgt ")) output = "Zero G: " + output.slice(4);
    if (output.startsWith("foip ")) output = "FOIP: " + output.slice(5);
    if (output.startsWith("pc ")) output = "" + output.slice(3);
    if (output.startsWith("qs ")) output = "QS: " + output.slice(3);
    if (output.startsWith("view ")) output = "Free Cam: " + output.slice(4);

    output = output
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return output;
}


//#endregion





//#region Global Vars

const actionMapsMasterList = [];
let connectedGamepads = {};

let bindingsProfileName = "StarBinder"

const keybindSearch = document.getElementById(`keybindSearch`);

const btnKeybindSearch = document.querySelector('.searchbar-button');
const rowContainer = document.querySelector('.content-keybinds');
const tagContainer = document.getElementById('tagContainer')
const subTagContainer = document.getElementById('subTagContainer')

const btnSelectInput_Keyboard = document.querySelector('.button-inputSelect-keyboard');
const btnSelectInput_Controller = document.querySelector('.button-inputSelect-controller');
const btnSelectInput_Joystick = document.querySelector('.button-inputSelect-joystick');

const footer = document.querySelector('.footer');
const keybindDescriptionDiv = document.querySelector('.footer__keybind-info');
const keybindDescriptionText = keybindDescriptionDiv.querySelector('.footer__keybind-text');
const keybindDescriptionTags = keybindDescriptionDiv.querySelector('.footer__keybind-tags');

const conflictsToggle = document.getElementById('conflictsToggle');
const boundActionsToggle = document.getElementById('boundActionsToggle');
let showBoundActionsState = 0;


const showHelpButton = document.querySelector('.info-toggle')
const infoClass = document.querySelector('.info-section')
const infoContent = document.querySelector('.info-content')

showHelpButton.addEventListener("click", () =>
{
    const section = infoClass;
    const content = infoContent;

    if (section.classList.contains("collapsed"))
    {
        // Expand
        showHelpButton.textContent = "Hide help";
        section.style.height = section.scrollHeight + "px";
        content.style.height = content.scrollHeight + "px";
        section.style.opacity = 1;
        content.style.opacity = 1;

        section.classList.remove("collapsed");
        content.classList.remove("collapsed");

        // Scroll after a tiny delay so content has started expanding
        setTimeout(() =>
        {
            // Remove fixed height after transition so it grows naturally
            section.style.height = "auto";
            content.style.height = "auto";
            // Scroll content so it is ~20% from the top of viewport
            const rect = content.getBoundingClientRect();
            const offset = rect.top + window.scrollY - window.innerHeight * 0.2;
            window.scrollTo({
                top: offset,
                behavior: "smooth"
            });
        }, 100); // 100ms delay gives browser time to start the expansion
    } else
    {
        // Collapse
        showHelpButton.textContent = "Show help";
        section.style.height = section.scrollHeight + "px"; // set current height
        content.style.height = content.scrollHeight + "px";

        requestAnimationFrame(() =>
        {
            section.style.height = "0px";
            content.style.height = "0px";
            section.style.opacity = 0;
            content.style.opacity = 0;
        });

        section.classList.add("collapsed");
        content.classList.add("collapsed");
    }
});




//filter tags at the top
const categoryTags = ["Vehicle", "On Foot", "Comms/Social", "Camera", "Other"];
let filteredNames = "";

let recordingActive;
let recordTimeout = null;


let activeCapture = null;
let currentlySelectedKeybindElement = null;
let currentKeyBind = null;

let holdTimer = null;
let selectedTags = [];
let fuse = null;

const textValue_UNBOUND = '';

//////////////////////////////
//      ACTIVATION MODES    //
//////////////////////////////
const activationModeType = {
    PRESS: 'press',
    PRESS_QUICKER: 'press_quicker',
    PRESS_SHORT: 'delayed_press_quicker',
    PRESS_MEDIUM: 'delayed_press',
    PRESS_EXTRA_MEDIUM: 'delayed_press_medium',
    PRESS_LONG: 'delayed_press_long',
    TAP: 'tap',
    TAP_QUICKER: 'tap_quicker',
    DOUBLETAP_BLOCKING: 'double_tap',
    DOUBLETAP_NONBLOCKING: 'double_tap_nonblocking',
    HELD: 'hold',
    HOLD_SHORT: 'delayed_hold',
    HOLD_LONG: 'delayed_hold_long',
    HOLD_NO_RETRIGGER: 'hold_no_retrigger',
    HOLD_LONG_NO_RETRIGGER: 'delayed_hold_no_retrigger',
    ALL: 'all',
    HOLD_TOGGLE: 'hold_toggle',
    SMART_TOGGLE: 'smart_toggle'
}





//////////////////////////////
//      STATE MACHINE       //
//////////////////////////////

const InputModeSelection = Object.freeze(
    {
        KEYBOARD: "keyboard",
        CONTROLLER: "controller",
        JOYSTICK: "joystick",
        MOUSE: "mouse"
    }
)

const InputState = {
    current: InputModeSelection.KEYBOARD,
    set(mode)
    {
        this.current = mode;
        onModeChangeUpdateUI();
    }
}

function onModeChangeUpdateUI()
{
    updatefilteredNames();
}

//#endregion


init();

const keywordCategories =
{
    //left side = keyword in json
    //right side = which filter it appears under

    'vehicle': "vehicle",
    "@ui_CCSeatGeneral": "vehicle",
    "@ui_CCVehicle": "vehicle",
    "@ui_CCSpaceFlight": "vehicle",
    "@ui_CGLightControllerDesc": ["vehicle", "vehicle - other"],
    "@ui_CCTurrets": ["vehicle", "turrets"],
    'turrets': ["vehicle", "turrets"],
    'communication': "comms/social",
    'other': "other",
    'camera': "camera",
    "@ui_CCCamera": "camera",
    "on foot": "on foot",
    "@ui_CCFPS": ["on foot"],
    "@ui_CCEVA": ["on foot", "eva"],
    "zero_gravity_eva": ["on foot", "eva"],
    "zero_gravity_traversal": ["on foot", "eva"],
    "@ui_CCEVAZGT": ["on foot", "eva"],
    "@ui_CGInteraction": ["other", "interaction"],
    "player_choice": ["other", "interaction"],
    salvage: "salvage",
    mining: "mining",
    'vehicle control': "vehicle control",
    defences: "defences",
    weapons: "weapons",
    power: "power",
    combat: "combat",
    equipment: 'equipment',
    "@ui_CGEASpectator": ["other", "spectator"],
    "spectator": ["other", "spectator"],
    "default": ["other"],
    "@ui_CGUIGeneral": "other",
    "ui_notification": "other",
    "@ui_CGOpticalTracking": ["other", "optical tracking", "FOIP/VOIP"],
    "player_input_optical_tracking": ["other", "optical tracking", "FOIP/VOIP"],
    "mfds": ["vehicle", "mfds"],
    "MFDs": ["vehicle", "mfds"],
    "Emotes": ["comms/social", "emotes"],
    "none": "none",
    "vehicle - other": "vehicle - other",
    "ShipSystems": ["vehicle", "systems"],
    "FlightSystems": ["vehicle", "systems"],
    "spaceship_radar": ["vehicle", "systems"],
    "spaceship_scanning": ["vehicle", "systems"],
    "lights_controller": ["vehicle", "systems", "vehicle - other"],
    "spaceship_hud": ["vehicle", "vehicle - other"],
    "RemoteTurret": ["turrets", "remote turrets"],
    "MobiGlasActions": ["mobiglas", "other"],
    "WeaponSelection": ["on foot", "combat"],
    "tractor_beam": ["on foot", "equipment"],
    "MiningMode": ["vehicle", "mining"],
    "WeaponSystems": ["vehicle", "weapons"],
    "ItemActions": ["on foot"],
    "prone": ["on foot"],
    "player": ["on foot"],
    "incapacitated": ["on foot", "on foot - other"],
    "VehicleActions": ["vehicle"],
    "PlayerActions": " ",
    "Notifications": "other",
    "seat_general": ["vehicle"],
    "spaceship_general": ["vehicle"],
    "spaceship_mining": ["vehicle", "mining"],
    "spaceship_weapons": ["vehicle", "weapons"],
    "spaceship_missiles": ["vehicle", "weapons"],
    "spaceship_defensive": ["vehicle", "defences"],
    "spaceship_power": ["vehicle", "power"],
    "vehicle_mfd": ["vehicle", "mfds"],
    "vehicle_driver": ["vehicle"],
    "vehicle_general": ["vehicle"],
    "spaceship_salvage": ["vehicle", "salvage"],
    "spaceship_movement": ["vehicle", "movement"],
    "spaceship_quantum": ["vehicle", "movement"],
    "spaceship_docking": ["vehicle", "movement"],
    "spaceship_view": ["vehicle", "vehicle - other"],
    "stopwatch": ["vehicle", "vehicle - other"],
    "spaceship_targeting": ["vehicle", "targeting"],
    "spaceship_targeting_advanced": ["vehicle", "targeting"],
    "turret_movement": ["vehicle", "turrets"],
    "turret_advanced": ["vehicle", "turrets"],
    "player_emotes": ["comms/social", "emotes"],
    "spaceship_target_hailing": ["vehicle", "targeting", "vehicle - other", "comms/social", "comms - other"],
    "view_director_mode": ["camera"],
    "": ["", ""],
    "": ["", ""],
    "": ["", ""],
}


function resolveKeywords(jsonObj, _name = "name not specified")
{
    return jsonObj.flatMap(k =>
    {
        const mapped = keywordCategories[k];
        if (!mapped)
        {
            console.log("Error with category name:", k, _name);
            return [k];
        }
        return Array.isArray(mapped) ? mapped : [mapped];
    });
}


//#region MappedAction
function getOrCreateActionKeywords(key)
{
    if (!actionMapDictionary[key])
    {
        actionMapDictionary[key] = { keywords: [] };
    } else if (!actionMapDictionary[key].keywords)
    {
        actionMapDictionary[key].keywords = [];
    }
    return actionMapDictionary[key].keywords;
}

class MappedAction
{
    actionMapName;     // e.g. "Seat - General"
    actionName;        // literal name from XML
    actionParsedName;  // mapped pretty name (WIP)
    actionCustomName;  // user-chosen custom name

    description;        //Describes how the keybind works in the game
    keywordTags = [];        //keywords array, for searching and filtering.

    bind = {
        [InputModeSelection.KEYBOARD]: { bindable: true, input: "", defaultBind: "", activationMode: "", defaultActivationMode: "", deviceIndex: "1" },
        [InputModeSelection.MOUSE]: { bindable: true, input: "", defaultBind: "", activationMode: "", defaultActivationMode: "", deviceIndex: "1" },
        [InputModeSelection.CONTROLLER]: { bindable: true, input: "", defaultBind: "", activationMode: "", defaultActivationMode: "", deviceIndex: "1" },
        [InputModeSelection.JOYSTICK]: { bindable: true, input: "", defaultBind: "", activationMode: "", defaultActivationMode: "", deviceIndex: "1" }
    }

    constructor({
        actionName,       // "v_strafe_up"
        mapName,          // "spaceship_movement"
        keyboardBind,     // "w"
        mouseBind,        // "mwheel_up"
        gamepadBind,      // "thumbly"
        joystickBind,     // "x"
        activationMode,   // "tap" / "hold" / "press"
        category,         // "FlightSystems"
        UICategory,         // "@ui_CCFPS"
        label,            // "@ui_CGINTERACTION"
        description,       // "@ui_CIStrafeUpDesc"
        version
    })
    {
        Object.assign(this, arguments[0]);
        this.actionMapName = mapName;


        if (this.mapName) getOrCreateActionKeywords(this.actionName).push(this.mapName);
        if (this.category) getOrCreateActionKeywords(this.actionName).push(this.category);
        if (this.UICategory) getOrCreateActionKeywords(this.actionName).push(this.UICategory);
        else if (this.label?.startsWith("@ui_CIMFD"))
        {
            getOrCreateActionKeywords(this.actionName).push("MFDs");
        }
        else
        {
            getOrCreateActionKeywords(this.actionName).push("none");
        }

        const keywords = new Set(resolveKeywords(getActionKeywords(this.actionName), "Action: " + this.actionName));

        keywords.forEach(k => this.keywordTags.push(k));

        this.setDefaultBind(InputModeSelection.KEYBOARD, this.keyboardBind ?? this.mouseBind)
        this.setDefaultBind(InputModeSelection.CONTROLLER, this.gamepadBind)
        this.setDefaultBind(InputModeSelection.JOYSTICK, this.joystickBind)

        const activtationType = this.activationMode ? this.activationMode : activationModeType.PRESS;
        this.setActivationMode(activtationType, InputModeSelection.KEYBOARD)
        this.setActivationMode(activtationType, InputModeSelection.CONTROLLER)
        this.setActivationMode(activtationType, InputModeSelection.JOYSTICK)
        this.setDefaultActivationMode(activtationType, InputModeSelection.KEYBOARD)
        this.setDefaultActivationMode(activtationType, InputModeSelection.CONTROLLER)
        this.setDefaultActivationMode(activtationType, InputModeSelection.JOYSTICK)

        this.setDescription();

        // Find index of existing entry with the same actionName
        const existingIndex = actionMapsMasterList.findIndex(a => a.actionName === this.actionName);

        if (existingIndex >= 0)
        {
            // Replace existing entry in-place
            actionMapsMasterList[existingIndex] = this;
        } else
        {
            // Push new entry
            actionMapsMasterList.push(this);
        }

    }

    // ===== getters/setters =====
    getActionName() { return this.actionName; }
    setActionName(n) { this.actionName = n; return this; }

    getParsedName() { return this.actionParsedName; }
    setParsedName(str)
    {
        this.actionParsedName = str;
        return this;
    }

    getCustomName() { return this.actionCustomName; }
    setCustomName(str) { this.actionCustomName = str; return this; }

    getActionMapName() { return this.actionMapName; }
    setActionMapName(str) { this.actionMapName = str; return this; }

    getDescription() { return this.description; }
    setDescription(str)
    {
        //if str, then the description will be that, otherwise it is the one from the JSON; else default text.
        if (!str)
        {
            str = getActionDescription(this.getActionName());
        }
        this.description = str;
    }

    getKeywords() { return this.keywordTags; }
    setKeywords(keywords)
    {
        if (!keywords && this.getActionName())
        {
            keywords = getActionKeywords(this.getActionName())
        }
        keywords.push(this.getActionMapName())
        this.keywordTags = keywords;

    }

    getBind(state = InputState.current)
    {
        return this.bind[state].input;
        // return this.bind[state][0];
    }
    setBind(state = InputState.current, bindString)
    {
        this.bind[state].input = bindString.trim();
    }
    getDefaultBind(state = InputState.current)
    {
        return this.bind[state].defaultBind;
        // return this.bind[state][0];
    }
    setDefaultBind(state = InputState.current, bindString)
    {
        // this.bind[state] = [bindString, deviceIndex];
        this.bind[state].defaultBind = bindString;
    }
    getBindDevice(state = InputState.current)
    {
        // const deviceNumber = this.bind[state][1] || 1;
        const deviceNumber = this.bind[state].deviceIndex || 1;
        return deviceNumber;
    }
    setBindDevice(state = InputState.current, deviceIndex)
    {
        this.bind[state].deviceIndex = deviceIndex;
    }

    // getActivationMode(state = InputState.current, getWhich = 0)
    // {
    //     if (!this.inputActivationMode) this.inputActivationMode = {};

    //     if (!this.inputActivationMode[state])
    //         this.inputActivationMode[state] = [null, null];

    //     return this.inputActivationMode[state][getWhich];
    // }

    // setActivationMode(mode, state = InputState.current, defaultMode = this.inputActivationMode[state][1])
    // {
    //     this.inputActivationMode[state] = [mode, defaultMode];
    // }
    getActivationMode(state = InputState.current)
    {
        return this.bind[state].activationMode;
    }
    setActivationMode(mode, state = InputState.current)
    {
        this.bind[state].activationMode = mode;
    }
    getDefaultActivationMode(state = InputState.current)
    {
        return this.bind[state].defaultActivationMode;
    }
    setDefaultActivationMode(mode, state = InputState.current)
    {
        this.bind[state].defaultActivationMode = mode;
    }
    clearBind()
    {
        this.setBind(InputState.current, "")
        this.setBindDevice(InputState.current, "1")
        this.setActivationMode(this.getDefaultActivationMode(InputState.current), InputState.current)
        onUserChangedBind(this)
    }

    //========================================

    /**
    * Converts a keybind string (e.g. "kb1_lctrl+k") into an array of keys.
    * @param {string} bindStr - full keybind string
    * @returns {string[]} array of keys, first element is device, rest are keys
    */
    parseKeybindToArray = function (bindStr)
    {
        if (!bindStr || typeof bindStr !== "string") return [];
        // Split into device and the rest
        const [device, rest] = bindStr.split(/_(.+)/); // split on first underscore
        if (!rest) return [device];

        // Split remaining keys by '+' and remove empty strings
        const keys = rest.split("+").filter(k => k.trim() !== "");
        return [device, ...keys];
    };

    parseKeywordsForDescription(keywordsArray)
    {
        return keywordsArray
            ?.filter(Boolean) // no empty values
            .join('] [') || '';
    }


}

//#endregion


//#region Initialisation Function

async function init()
{

    //read json
    try
    {
        const response = await fetch('./keybinds.json');
        if (!response.ok) throw new Error('Failed to load JSON');
        actionMapDictionary = await response.json();

        // Now you can use actionMapDictionary as before
    } catch (err)
    {
        console.error("Error loading action map dictionary:", err);
    }
    keybindSearch.value = '';

    // Prevent context menu globally
    document.addEventListener('contextmenu', e => e.preventDefault());

    // wait for DOM
    await new Promise(resolve =>
    {
        if (document.readyState === "loading")
        {
            document.addEventListener("DOMContentLoaded", resolve);
        } else
        {
            resolve();
        }
    });

    tagContainer.classList.add('tag-container');
    subTagContainer.classList.add('subTag-container');

    tagContainer.addEventListener('click', onClickFilterTag);
    subTagContainer.addEventListener('click', onClickFilterTag);

    // now both DOM and XML load in a controlled order

    // await loadAndParseDataminedXML();
    await initActionMaps();

    initFuse();       // <--- Fuse.js initialized after XML loads

    // then show binds
    generateMainCategoryTags();

    // Button click triggers search
    btnKeybindSearch.addEventListener('click', performSearch);

    // Pressing Enter in input triggers search
    keybindSearch.addEventListener('keydown', (e) =>
    {
        if (e.key === 'Enter')
        {
            e.preventDefault();
            performSearch();
        }
    });

    boundActionsToggle.dataset.state = showBoundActionsState;
    boundActionsToggle.addEventListener('click', onToggleFilter_BoundActions)
    conflictsToggle.addEventListener('change', onToggleFilter_Conflicts)

    document.querySelector('.button--clear').addEventListener("click", onClickClearAllKeybinds)
    document.querySelector('.button--export').addEventListener('click', onClickExportKeybinds)
    document.querySelector('.button--import').addEventListener('click', onClickImportKeybinds)
    rowContainer?.addEventListener("click", onClickSelectActivationMode);
    rowContainer?.addEventListener("click", onClickKeybindElement)
    document.addEventListener("click", onClickAnywhereDeselectKeybind);
    rowContainer?.addEventListener("dblclick", onClickRecordKeybind);
    rowContainer?.addEventListener("keydown", function (e)
    {
        if (e.key === "Enter")
        {
            e.preventDefault();
            onSubmitKeybindConsole(e);
        }
    });
    rowContainer?.addEventListener("focusin", onClickKeybindElement)
    rowContainer?.addEventListener("focusin", onFocusConsoleInput)
    rowContainer?.addEventListener("focusout", onLoseFocusConsoleInput)
    keybindDescriptionTags.addEventListener("click", onClickFilterTag);
    rowContainer.addEventListener("mousedown", (e) =>
    {
        const targetRow = e.target.closest(".keybind__row");

        if (targetRow === currentlySelectedKeybindElement)
        {
            holdTimer = setTimeout(() =>
            {
                onClickClearKeybind();
            }, 500);
        }
    });

    rowContainer.addEventListener("mouseup", () =>
    {
        clearTimeout(holdTimer);
    });


    ///// GAMEPAD DETECTION  //////

    btnSelectInput_Keyboard.addEventListener("click", e => setInputMode(InputModeSelection.KEYBOARD));
    btnSelectInput_Controller.addEventListener("click", e => setInputMode(InputModeSelection.CONTROLLER));
    btnSelectInput_Joystick.addEventListener("click", e => setInputMode(InputModeSelection.JOYSTICK));
    btnSelectInput_Keyboard.click()
    ClearKeybindDescription();
    loadMappedActions();

}

//#endregion

const inputButtons = {
    [InputModeSelection.KEYBOARD]: btnSelectInput_Keyboard,
    [InputModeSelection.CONTROLLER]: btnSelectInput_Controller,
    [InputModeSelection.JOYSTICK]: btnSelectInput_Joystick
};


function setInputMode(mode)
{
    if (activeCapture) return
    InputState.set(mode);

    // Loop through all buttons and toggle the 'selected' class
    Object.entries(inputButtons).forEach(([key, btn]) =>
    {
        if (key === mode)
        {
            btn.classList.add('selected');
        } else
        {
            btn.classList.remove('selected');
        }
    });
}


//#region XML PARSING
// ========== XML Parsing ==========
async function loadAndParseDataminedXML()
{
    let text;
    try
    {
        const response = await fetch("./actionmaps.xml");
        if (!response.ok) throw new Error(`HTTP ${ response.status }`);
        text = await response.text();
    } catch (err)
    {
        console.error("Failed to load XML:", err);
        return [];
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    if (xmlDoc.documentElement.nodeName === "parsererror")
    {
        console.error("Error parsing XML");
        return [];
    }

    const mappedActions = [];
    const seenActionNames = new Set();
    const excludedCategories = ["debug"];

    xmlDoc.querySelectorAll("actionmap").forEach(map =>
    {
        const mapName = map.getAttribute("name");
        const mapVersion = map.getAttribute("version");
        const UICategory = map.getAttribute("UICategory")


        if (excludedCategories.includes(mapName)) return;

        map.querySelectorAll("action").forEach(action =>
        {
            const actionName = action.getAttribute("name");
            const label = action.getAttribute("UILabel");
            const description = action.getAttribute("UIDescription");
            const category = action.getAttribute("Category");

            // Skip if no actionName, duplicate, no UICategory, starts with 'flashui',
            // or none of label/description/category exist
            if (
                !actionName ||
                seenActionNames.has(actionName) ||
                // !UICategory ||
                actionName.startsWith('flashui') ||
                (!label && !description && !category)
            ) return;


            seenActionNames.add(actionName);

            const actionObj = new MappedAction({
                actionName,
                mapName,
                mapVersion,
                keyboardBind: action.getAttribute("keyboard") || "",
                mouseBind: action.getAttribute("mouse") || "",
                gamepadBind: action.getAttribute("gamepad") || "",
                joystickBind: action.getAttribute("joystick") || "",
                activationMode: action.getAttribute("activationMode") || null,
                category,
                label,
                description,
                UICategory,
            });
            mappedActions.push(actionObj);

            if (!action.getAttribute("keyboard"))
            {
                actionObj.bind[InputModeSelection.KEYBOARD].bindable = false;
            }
            if (!action.getAttribute("mouse"))
            {
                actionObj.bind[InputModeSelection.MOUSE].bindable = false;
            }
            if (!action.getAttribute("gamepad"))
            {
                actionObj.bind[InputModeSelection.CONTROLLER].bindable = false;
            }
            if (!action.getAttribute("joystick"))
            {
                actionObj.bind[InputModeSelection.JOYSTICK].bindable = false;
            }
        });
    });
    return mappedActions;
}
/*
==========================================
 KEYBIND ACTIVATION MODE REFERENCE
==========================================

Each activationMode defines WHEN and HOW a bind triggers.
Can be added to any <rebind> or <action> as:
    activationMode="mode_name"

Attributes:
  onPress="1"     → fires when key/button is pressed
  onHold="1"      → active continuously while held
  onRelease="1"   → fires when released
  multiTap="2"    → number of taps required (1 = single, 2 = double)
  multiTapBlock="1" → prevents single-tap triggering when waiting for multi-tap
  pressTriggerThreshold="x" → hold time (seconds) before counting as "press"
  releaseTriggerThreshold="x" → release time window (seconds) for tap detection
  releaseTriggerDelay="x" → delay before release event triggers
  retriggerable="1" → allows multiple activations while held

e.g. MultiTap="4" requires 4 quick taps, 3 or less does nothing.

------------------------------------------
 Mode Name               | Behavior Summary
------------------------------------------

tap
  Fires on release after a short press.
  - onRelease=1, releaseTriggerThreshold=0.25
  → Quick taps / toggles.

tap_quicker
  Same as tap but faster timeout.
  - releaseTriggerThreshold=0.15

double_tap
  Fires only on double-tap, blocks single tap.
  - multiTap=2, multiTapBlock=1

double_tap_nonblocking
  Double-tap fires but doesn’t block single tap.
  - multiTap=2, multiTapBlock=0

press
  Fires immediately on key press.
  - onPress=1

press_quicker
  Fires on press, and again on release (faster).
  - onPress=1, onRelease=1, releaseTriggerThreshold=0.15

delayed_press
  Activates only if held >0.25s.
  - pressTriggerThreshold=0.25

delayed_press_quicker
  Activates only if held >0.15s.

delayed_press_medium
  Activates only if held >0.5s.

delayed_press_long
  Activates only if held >1.5s.
  → Good for “hold to confirm” type actions.

hold
  Fires on press and release, retriggerable while held.
  - onPress=1, onRelease=1, retriggerable=1
  → Continuous fire / acceleration.

hold_no_retrigger
  Fires on press and release, but once per hold.

all
  Fires on press, hold, and release.
  - onPress=1, onHold=1, onRelease=1
  → Catches every input event.

delayed_hold
  Like hold, but only after holding >0.25s.

delayed_hold_long
  Like hold, but only after holding >1.5s.

delayed_hold_no_retrigger
  Hold activation (0.15s delay), fires once per hold.

hold_toggle
  Toggles state on press, fires again on release.
  → Acts like an on/off hold toggle.

smart_toggle
  Short press toggles, long press acts as hold.
  - releaseTriggerDelay=0.25
  → Excellent for contextual keys (e.g., ADS).

------------------------------------------
 Example Usage in Exported Bind File
------------------------------------------

<rebind input="kb1_f" activationMode="tap" />
<rebind input="kb1_mouse2" activationMode="smart_toggle" />
<rebind input="kb1_r" activationMode="delayed_press_long" />
<rebind input="kb1_v" activationMode="double_tap" />

------------------------------------------
 Notes
------------------------------------------
- If activationMode is omitted, default is equivalent to "press".
- You can combine with multiTap / retriggerable directly in <rebind>.
- Only one activationMode applies per binding.
- Timing thresholds (0.15 / 0.25 / 0.5 / 1.5) are in seconds.
 */
function exportMappedActionsToXML(actionMapsMasterList)
{
    // Start root node
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="${ bindingsProfileName }">\n`;

    // Optional: basic header scaffold (mirroring your example)
    xml += ` <CustomisationUIHeader label="${ bindingsProfileName }" description="" image="">\n`;
    xml += `  <devices>\n   <keyboard instance="1"/>\n   <mouse instance="1"/>\n   <joystick instance="1"/>\n  </devices>\n`;
    xml += ` </CustomisationUIHeader>\n`;
    xml += ` <modifiers />\n`;

    // Group actions by actionMapName
    const grouped = {};
    for (const action of actionMapsMasterList)
    {
        const keyboardBind = action.getBind(InputModeSelection.KEYBOARD)?.trim();
        const mouseBind = action.getBind(InputModeSelection.MOUSE)?.trim();
        const controllerBind = action?.getBind(InputModeSelection.CONTROLLER)?.trim();
        const joystickBind = action.getBind(InputModeSelection.JOYSTICK)?.trim();
        if (keyboardBind !== "" || mouseBind !== "" || controllerBind !== "" || joystickBind !== "")
        {
            if (!grouped[action.actionMapName]) grouped[action.actionMapName] = [];
            grouped[action.actionMapName].push(action);
        }
    }
    // Write each actionmap block
    for (const [mapName, actions] of Object.entries(grouped))
    {
        xml += ` <actionmap name="${ mapName }">\n`;
        for (const action of actions)
        {
            xml += `  <action name="${ action.actionName }">\n`;
            const keyboardBind = action.getBind(InputModeSelection.KEYBOARD)?.trim();
            const mouseBind = action.getBind(InputModeSelection.MOUSE)?.trim();
            const controllerBind = action?.getBind(InputModeSelection.CONTROLLER)?.trim();
            const joystickBind = action.getBind(InputModeSelection.JOYSTICK)?.trim();

            if (keyboardBind && keyboardBind?.trim() != "")
            {

                const deviceIndex = "kb" + action.getBindDevice(InputModeSelection.KEYBOARD) + "_";
                xml += `   <rebind input="${ deviceIndex }${ keyboardBind }"`;
                if (action.getActivationMode(InputModeSelection.KEYBOARD)) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.KEYBOARD) }"`;
                xml += `/>\n`;
            }
            if (controllerBind && controllerBind?.trim() != "")
            {
                const deviceIndex = "gp" + action.getBindDevice(InputModeSelection.CONTROLLER) + "_";
                xml += `   <rebind input="${ deviceIndex }${ controllerBind }"`;
                if (action.getActivationMode(InputModeSelection.CONTROLLER)) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.CONTROLLER) }"`;
                xml += `/>\n`;
            }
            if (joystickBind && joystickBind?.trim() != "")
            {
                const deviceIndex = "js" + action.getBindDevice(InputModeSelection.JOYSTICK) + "_";
                xml += `   <rebind input="${ deviceIndex }${ joystickBind }"`;
                if (action.getActivationMode(InputModeSelection.JOYSTICK)) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.JOYSTICK) }"`;
                xml += `/>\n`;
            }

            xml += `  </action>\n`;
        }

        xml += ` </actionmap>\n`;
    }

    // Close root
    xml += `</ActionMaps>\n`;

    return xml;
}
// ========== CUSTOM KEYBINDS IMPORTER ==========
async function importCustomKeybindsXML(fileOrUrl)
{
    let text;
    try
    {
        if (fileOrUrl instanceof File)
        {
            text = await fileOrUrl.text();
        } else
        {
            const response = await fetch(fileOrUrl);
            if (!response.ok) throw new Error(`HTTP ${ response.status }`);
            text = await response.text();
        }
    } catch (err)
    {
        console.error("Failed to load XML:", err);
        return;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    if (xmlDoc.documentElement.nodeName === "parsererror")
    {
        console.error("Error parsing XML");
        return;
    }

    xmlDoc.querySelectorAll("actionmap").forEach(map =>
    {
        const mapName = map.getAttribute("name");

        map.querySelectorAll("action").forEach(action =>
        {
            const actionName = action.getAttribute("name");
            if (!actionName) return;

            // --- Assign consts for debugging/testing ---
            const importActionName = actionName;
            const importMapName = mapName;

            let importKeyboardBind = [null, null, null];   // [device, bindString, activationMode]
            let importControllerBind = [null, null, null];
            let importJoystickBind = [null, null, null];
            let importMouseBind = [null, null, null];

            // Nested helper to parse input like "kb1_W"
            function parseInput(inputStr)
            {
                const mapping = {
                    kb: "keyboard",
                    gp: "controller",
                    js: "joystick",
                    ms: "mouse"
                };
                const match = inputStr.match(/^([a-z]{2})(\d+)_?(.*)$/i);
                if (!match) return { type: "keyboard", bind: inputStr, device: null };
                const [, prefix, deviceNum, bindKey] = match;
                return {
                    type: mapping[prefix] || "keyboard",
                    bind: bindKey || "",
                    device: parseInt(deviceNum, 10)
                };
            }

            action.querySelectorAll("rebind").forEach(rebind =>
            {
                const input = rebind.getAttribute("input");
                // const activationMode = rebind.getAttribute("activationMode") || null;

                const activationMode =
                    rebind.getAttribute("activationMode") ??
                    (rebind.hasAttribute("multiTap") ? `double_tap` : null);


                if (!input) return;

                const { type, bind, device } = parseInput(input);

                if (!type || !bind) return;

                // Assign to appropriate const array
                switch (type)
                {
                    case "keyboard":
                        importKeyboardBind = [device, bind, activationMode];
                        break;
                    case "controller":
                        importControllerBind = [device, bind, activationMode];
                        break;
                    case "joystick":
                        importJoystickBind = [device, bind, activationMode];
                        break;
                    case "mouse":
                        importMouseBind = [device, bind, activationMode];
                        break;
                }
            });

            // --- Debugging output ---
            // console.log(importActionName, importMapName, importKeyboardBind, importControllerBind, importJoystickBind, importMouseBind);

            const mappedActionObj = actionMapsMasterList.find(a => a.actionName === importActionName);

            if (mappedActionObj)
            {
                if (importKeyboardBind && !importKeyboardBind.every(v => v === null))
                {
                    mappedActionObj.setBind(InputModeSelection.KEYBOARD, importKeyboardBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.KEYBOARD, importKeyboardBind[0])
                    mappedActionObj.setActivationMode(importKeyboardBind[2], InputModeSelection.KEYBOARD);
                }
                if (importControllerBind && !importControllerBind.every(v => v === null))
                {
                    mappedActionObj.setBind(InputModeSelection.CONTROLLER, importControllerBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.CONTROLLER, importControllerBind[0])
                    mappedActionObj.setActivationMode(importControllerBind[2], InputModeSelection.CONTROLLER);
                }
                if (importJoystickBind && !importJoystickBind.every(v => v === null))
                {
                    mappedActionObj.setBind(InputModeSelection.JOYSTICK, importJoystickBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.JOYSTICK, importJoystickBind[0])
                    mappedActionObj.setActivationMode(importJoystickBind[2], InputModeSelection.JOYSTICK);
                }
                if (importMouseBind && !importMouseBind.every(v => v === null))
                {
                    mappedActionObj.setBind(InputModeSelection.MOUSE, importMouseBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.MOUSE, importMouseBind[0])
                    mappedActionObj.setActivationMode(importMouseBind[2], InputModeSelection.MOUSE);
                }
            }
            else
            {
                console.log("keybind not found");
            }

        });
    });
}


//#endregion




//#region Search Functionality

function performSearch()
{
    const query = keybindSearch.value.trim();
    if (!query)
    {
        updatefilteredNames();
        return;
    }

    const results = fuse.search(query);
    filteredNames = results.map(r => r.item.actionName);
    updatefilteredNames(); // assumes showAllBinds can take array of names
}
function initFuse()
{
    const list = actionMapsMasterList.map(a => ({
        actionName: a.getActionName(),
        parsedLabel: getActionLabel(a.getActionName()),
        description: a.getDescription(),
        keywords: a.getKeywords().join(' ')
    }));

    fuse = new Fuse(list, {
        keys: [
            { name: 'actionName', weight: 0.5 },
            { name: 'parsedLabel', weight: 0.3 },
            { name: 'description', weight: 0.2 },
            { name: 'keywords', weight: 0.4 }
        ],
        threshold: 0.2,
        includeScore: true
    });

}
// Main filtering function
function updatefilteredNames()
{
    const searchQuery = keybindSearch.value.toLowerCase().trim();

    let filtered = [...actionMapsMasterList];

    // --- Bound/Unbound filtering ---
    if (showBoundActionsState === 1)
    {
        filtered = filtered.filter(item =>
        {
            const b = item.getBind();
            return typeof b === "string" && b.trim().length > 0;
        });

    } else if (showBoundActionsState === 2)
    {
        // Unbound: null, undefined, empty string, or whitespace
        filtered = filtered.filter(item =>
        {
            const b = item.getBind();
            return !b || !b.trim();
        });
    }

    // --- Tag filtering ---
    if (selectedTags.length > 0)
    {
        const normalizedTags = selectedTags.map(t => t.toLowerCase());
        filtered = filtered.filter(item =>
            item.getKeywords().some(k => normalizedTags.includes(k?.toLowerCase()))
        );
    }

    // --- Search filtering ---
    if (searchQuery)
    {

        if (fuse)
        {
            const results = fuse.search(searchQuery);
            const searchMatches = results.map(r =>
                actionMapsMasterList.find(a => a.getActionName() === r.item.actionName)
            );
            filtered = filtered.filter(f => searchMatches.includes(f));
        } else
        {
            filtered = filtered.filter(item =>
            {
                const name = item.getActionName().toLowerCase();
                const desc = item.getDescription().toLowerCase();
                const keywords = item.getKeywords().map(k => k.toLowerCase());
                return name.includes(searchQuery) ||
                    desc.includes(searchQuery) ||
                    keywords.some(k => k.includes(searchQuery));
            });
        }
    }

    if (conflictsToggle?.checked)
    {
        // Step 1: Group items by trimmed keybind
        const bindGroups = new Map();
        filtered.forEach(item =>
        {
            const key = item.getBind()?.trim();
            if (!key) return; // skip unbound
            if (!bindGroups.has(key)) bindGroups.set(key, []);
            bindGroups.get(key).push(item);
        });

        // Step 2: Keep only groups with conflicts (more than 1 item)
        const conflictGroups = Array.from(bindGroups.values()).filter(group => group.length > 1);

        // Step 3: Flatten the groups back into filtered list, grouped by keybind
        filtered = conflictGroups.flat();
    }

    filteredNames = filtered.map(item => item.getActionName());

    showAllBinds(filtered);
}


//special filtering
function onToggleFilter_BoundActions()
{
    showBoundActionsState = (showBoundActionsState + 1) % 3;
    boundActionsToggle.dataset.state = showBoundActionsState;

    const labelEl = boundActionsToggle.nextElementSibling; // the <span class="toggle-label">
    if (labelEl)
    {
        switch (showBoundActionsState)
        {
            case 0: labelEl.textContent = "All actions"; break;
            case 1: labelEl.textContent = "Bound only"; break;
            case 2: labelEl.textContent = "Unbound only"; break;
        }
    }
    updatefilteredNames();
}
function onToggleFilter_Conflicts()
{
    const state = conflictsToggle.checked;
    updatefilteredNames();
}



//#endregion




//#region Keybind Capture
const modifierGroups = new Set(['CONTROL', 'SHIFT', 'ALT']);
const modifierCodes = new Set([
    'ControlLeft', 'ControlRight',
    'ShiftLeft', 'ShiftRight',
    'AltLeft', 'AltRight',
    'MetaLeft', 'MetaRight'
]);
const mouseButtons = new Map([
    [0, 'MouseLeft'],
    [1, 'MouseMiddle'],
    [2, 'MouseRight'],
    [3, 'MouseButton4'],
    [4, 'MouseButton5'],
]);



// ---------- Keyboard capture ----------
document.addEventListener('keydown', e =>
{
    if (recordingActive && InputState.current !== InputModeSelection.KEYBOARD)
    {
        console.log("Cannot bind keyboard keys in " + InputState.current + " bind mode.");
        return;
    }
    if (!activeCapture) return;

    e.preventDefault();
    e.stopPropagation();
    cancelRecordTimer();
    if (e.key === 'Meta' || e.repeat) return;

    const code = e.code;
    const isModifier = modifierCodes.has(code);
    const mouseNames = Array.from(mouseButtons.values());

    const normalKeys = activeCapture.currentKeysOrdered.filter(
        k => !modifierCodes.has(k) && !mouseNames.includes(k)
    );

    if (isModifier)
    {
        if (normalKeys.length > 0 || activeCapture.currentKeys.has(code)) return;
        activeCapture.currentKeys.add(code);
        activeCapture.currentKeysOrdered.push(code);
    } else
    {
        if (activeCapture.currentKeys.has(code)) return;

        // Clear previous normal keys (cannot combine multiple normal keys with modifiers)
        normalKeys.forEach(nk =>
        {
            activeCapture.currentKeys.delete(nk);
            const idx = activeCapture.currentKeysOrdered.indexOf(nk);
            if (idx > -1) activeCapture.currentKeysOrdered.splice(idx, 1);
        });

        activeCapture.currentKeys.add(code);
        activeCapture.currentKeysOrdered.push(code);
    }

    const rowDiv = activeCapture.closest('.keybind__row');
    const valueDiv = rowDiv?.querySelector('.keybind__value');

    //this line
    if (valueDiv)
    {
        const translated = activeCapture.currentKeysOrdered.map(code => translateKey(code));
        const bindInProgress = translated.join('+');
        valueDiv.innerHTML = ''; // clear previous
        valueDiv.appendChild(renderKeybindKeys(bindInProgress));
    }
});

// ---------- Mouse capture ----------
document.addEventListener('pointerdown', e =>
{
    if (recordingActive && InputState.current !== InputModeSelection.KEYBOARD)
    {
        console.log("Cannot bind keyboard keys in " + InputState.current + " bind mode. " + recordingActive);
        return;
    }
    if (!activeCapture || e.target === activeCapture || e.pointerType !== 'mouse') return;

    e.preventDefault();
    cancelRecordTimer();
    // Allow modifiers + mouse, but not "regular key + mouse"
    const hasNormalKeys = Array.from(activeCapture.currentKeys)?.some(k => !modifierCodes.has(k));
    if (hasNormalKeys) return;

    const buttonName = mouseButtons.get(e.button);
    if (!buttonName) return;

    activeCapture.currentKeys.add(buttonName);
    activeCapture.currentKeysOrdered.push(buttonName);

    finalizeCapture_Keyboard(activeCapture, 1);
});

// ---------- Mouse wheel capture ----------
document.addEventListener('wheel', e =>
{
    if (recordingActive && InputState.current !== InputModeSelection.KEYBOARD)
    {
        console.log("Cannot bind keyboard keys in " + InputState.current + " bind mode.");
        return;
    }
    if (!activeCapture) return;

    e.preventDefault();
    cancelRecordTimer();
    const direction = e.deltaY < 0 ? 'mwheel_up' : 'mwheel_down';
    activeCapture.currentKeys = new Set([...activeCapture.currentKeys, direction]);
    activeCapture.currentKeysOrdered = [
        ...activeCapture.currentKeysOrdered.filter(k => k !== 'mwheel_up' && k !== 'mwheel_up'),
        direction
    ];

    finalizeCapture_Keyboard(activeCapture, 1);
}, { passive: false });

// ---------- Key release ----------
document.addEventListener('keyup', e =>
{
    if (recordingActive && InputState.current !== InputModeSelection.KEYBOARD)
    {
        return;
    }
    if (!activeCapture) return;
    if (activeCapture.currentKeys.has(e.code)) activeCapture.currentKeys.delete(e.code);

    if (activeCapture.currentKeys.size === 0) finalizeCapture_Keyboard(activeCapture);
});


// ---------- Finalize capture ----------
async function finalizeCapture_Keyboard(input, deviceIndex = 1)
{
    if (!input) return;
    recordingActive = false;

    // --- Validation logic ---
    const pressedKeys = input.currentKeysOrdered || [];
    const mouseKeys = pressedKeys.filter(k => Array.from(mouseButtons.values()).includes(k));
    const modifierKeys = pressedKeys.filter(k => modifierCodes.has(k));
    const normalKeys = pressedKeys.filter(k =>
        !modifierCodes.has(k) && !Array.from(mouseButtons.values()).includes(k)
    );

    let isValid = true;

    // Rule 1: No more than one mouse button
    if (mouseKeys.length > 1)
    {
        isValid = false;
    }

    // Rule 2: Two or more modifiers without any normal key = invalid
    else if (modifierKeys.length >= 2 && normalKeys.length === 0)
    {
        isValid = false;
    }

    // Rule 3: More than one normal key = invalid
    else if (normalKeys.length > 1)
    {
        isValid = false;
    }

    // Always re-enable the button
    input.disabled = false;
    const rowDiv = input.closest('.keybind__row');

    if (!isValid)
    {
        input.classList.add('invalid-keybind');
        setTimeout(() => input.classList.remove('invalid-keybind'), 300);
        input.classList.remove('recording');
        input.currentKeys = new Set();
        input.currentKeysOrdered = [];
        activeCapture = null;

        const valueDiv = rowDiv?.querySelector('.keybind__value');
        if (valueDiv)
        {
            const bindVal = input.dataset;
            const actionName = bindVal.actionName;
            const actionObj = actionMapsMasterList.find(a => a.getActionName() === actionName);
            valueDiv.innerHTML = ''; // clear previous
            valueDiv.appendChild(renderKeybindKeys(actionObj.getBind()));
            valueDiv.classList.remove('awaiting');
            adjustFontSizeBasedOnWidth(valueDiv);
        }
        return;
    }

    // Translate keys for storing
    const translated = pressedKeys.map(code => translateKey(code));
    const finalBind = (translated.join('+')).toLowerCase();
    await applyKeybind(finalBind, deviceIndex, input.dataset)


    // Reset capture state
    input.currentKeys = new Set();
    input.currentKeysOrdered = [];
    input.classList.remove('recording');
    activeCapture = null;

    updateBindRow(rowDiv);
}

async function finalizeCapture_Controller(input, deviceIndex = 1)
{
    recordingActive = false;

    const rowDiv = currentlySelectedKeybindElement.closest('.keybind__row');

    // Translate keys for storing
    const finalBind = input || "";

    await applyKeybind(finalBind, deviceIndex, currentlySelectedKeybindElement.dataset)

    // Reset capture state
    currentlySelectedKeybindElement.currentKeys = new Set();
    currentlySelectedKeybindElement.currentKeysOrdered = [];
    currentlySelectedKeybindElement.classList.remove('recording');
    activeCapture = null;

    updateBindRow(rowDiv);
}
async function finalizeCapture_Joystick(input, deviceIndex = 1)
{
    if (!input) return;
    recordingActive = false;


    // Always re-enable the button
    input.disabled = false;

    const rowDiv = currentlySelectedKeybindElement.closest('.keybind__row');

    // Translate keys for storing

    const finalBind = input;

    await applyKeybind(finalBind, deviceIndex, currentlySelectedKeybindElement.dataset)

    // Reset capture state
    currentlySelectedKeybindElement.currentKeys = new Set();
    currentlySelectedKeybindElement.currentKeysOrdered = [];
    currentlySelectedKeybindElement.classList.remove('recording');
    activeCapture = null;

    updateBindRow(rowDiv);
}

async function applyKeybind(bindstring, deviceIndex, bind)
{
    const actionName = bind.actionName;
    const actionObj = actionMapsMasterList.find(a => a.getActionName() === actionName);

    actionObj.setBind(InputState.current, bindstring);
    actionObj.setBindDevice(InputState.current, deviceIndex);
    stopPollingGamepads();
    stopPollingJoysticks();
    cancelRecordTimer();
    onUserChangedBind(getCurrentBindFromSelectedRow())
}

function getBindPrefix(deviceNumber = 1, currentState = InputState.current)
{
    const devicePrefix = {
        'keyboard': `kb${ deviceNumber }_`,
        'controller': `gp${ deviceNumber }_`,
        'joystick': `js${ deviceNumber }_`
    }
    return devicePrefix[currentState];
}


//#endregion


// ---------- Generate & Display UI to DOM for all of the  keybinds ----------
async function showAllBinds(filtered)
{
    // Only clear the keybind rows container
    rowContainer.innerHTML = '';
    const listToCheck = conflictsToggle?.checked ? filtered : actionMapsMasterList;

    // Determine which list to show
    let listToShow = filteredNames
        ? listToCheck.filter(a => filteredNames.includes(a.getActionName()))
        : listToCheck;
    // Render each keybind row
    await listToShow.forEach(b =>
    {
        if (b.bind[InputState.current].bindable || (InputState.current === InputModeSelection.KEYBOARD && b.bind[InputModeSelection.MOUSE].bindable))
        {
            renderBindRow(b)
        }
    });
    if (currentlySelectedKeybindElement != null)
    {
        const r = document.querySelector('.keybind__row--selected')
        navigateToRow(r)
    }
}

async function renderBindRow(b)
{
    const parsedName = getActionLabel(b.getActionName()) || b.getActionName();

    // --- Primary row ---
    const newRow = document.createElement('div');
    newRow.style.position = 'relative';
    newRow.dataset.actionName = b.getActionName();
    newRow.classList.add('keybind__row');
    if (currentlySelectedKeybindElement?.dataset.actionName === newRow.dataset.actionName)
    {
        newRow.classList.add('keybind__row--selected');
    }

    const typeDiv = document.createElement('div');
    typeDiv.classList.add('keybind__type', 'keybind__type--defaultKeybindStyle');
    typeDiv.textContent = parsedName;


    const valueDiv = document.createElement('div');
    valueDiv.classList.add('keybind__value');






    const activationModeIconDiv = document.createElement('div');
    activationModeIconDiv.classList.add('button-activationMode');

    const wrapper = document.createElement('div');
    wrapper.classList.add('button-wrapper');

    const icon = document.createElement('span');

    const tooltip = document.createElement('span');
    tooltip.classList.add('tooltip-text');
    tooltip.textContent = 'Click to set whether bind is a double tap.';

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);
    activationModeIconDiv.appendChild(wrapper);
    setActivationModeButtonIcon(activationModeIconDiv, b)


    const consoleInputDiv = document.createElement('div');
    addConsoleInputField(b, consoleInputDiv);


    newRow.appendChild(typeDiv);
    newRow.appendChild(valueDiv);
    newRow.appendChild(activationModeIconDiv);
    newRow.appendChild(consoleInputDiv);
    rowContainer.appendChild(newRow);
    updateBindRow(newRow)

}

function updateBindRow(bindRow = currentlySelectedKeybindElement)
{
    if (bindRow)
    {
        const bindValueDiv = bindRow.querySelector('.keybind__value');
        const consoleInputField = bindRow.querySelector('.keybind__consoleInput');
        const bind = actionMapsMasterList?.find(a => a?.getActionName() === bindRow?.dataset.actionName);

        const bindValue = bind.getBind();
        const bindDevice = bind.getBindDevice();

        if (bindValueDiv)
        {
            bindValueDiv.innerHTML = ''; // clear previous
            bindValueDiv.appendChild(renderKeybindKeys(bindValue ? `Device ${ bindDevice }: ${ bindValue }` : ``));
            bindValueDiv.classList.remove('awaiting');
            adjustFontSizeBasedOnWidth(bindValueDiv);
        }

        if (consoleInputField)
        {
            consoleInputField.value = "";
            consoleInputField.placeholder = bind.getBind() ? bind.getBindDevice() + ":" + bindValue : "";
        }
        ShowKeybindDescription();
    }
}

function addConsoleInputField(bind, div)
{
    const consoleField = document.createElement('input');
    consoleField.classList.add('keybind__consoleInput');

    consoleField.placeholder = bind.getBind();

    consoleField.setAttribute('spellcheck', 'false');
    consoleField.maxLength = 60;

    div.appendChild(consoleField);
}



function adjustFontSizeBasedOnWidth(valueDiv)
{
    let fontSize = 1.1; // rem
    valueDiv.style.fontSize = fontSize + 'rem';

    while (valueDiv.scrollWidth > valueDiv.clientWidth && fontSize > 0.6)
    {
        fontSize -= 0.05;
        valueDiv.style.fontSize = fontSize + 'rem';
    }
}


//#region Tag Generation
function generateMainCategoryTags()
{
    tagContainer.innerHTML = '';

    categoryTags.forEach(keyword =>
    {
        const tag = document.createElement('div');
        tag.classList.add('tag');
        tag.textContent = keyword;
        tag.dataset.keyword = keyword;
        tagContainer.appendChild(tag);
    });
}



//#endregion



/**
 * Converts a keybind string like "AltLeft+Insert" into styled DOM elements.
 * @param {string} keybindStr
 * @returns {DocumentFragment} - can be appended to a container
 */
function renderKeybindKeys(keybindString)
{
    // Example: "Device 1: AltLeft+Insert+ControlRight"
    if (!keybindString) return document.createElement('span');

    // Separate "Device x:" from the rest
    const deviceMatch = keybindString.match(/^Device\s+(\d+):\s*/i);
    let deviceLabel = null;
    if (deviceMatch)
    {
        deviceLabel = `${ deviceMatch[1] }`;
        keybindString = keybindString.replace(deviceMatch[0], '');
    }

    // Now split remaining part by '+'
    const keys = keybindString.split('+');
    const container = document.createElement('span');
    const leftIndicator = '◀';
    const rightIndicator = '▶';

    const replacements = {
        lalt: 'AltLeft',
        ralt: 'AltRight',
        lctrl: 'ControlLeft',
        rctrl: 'ControlRight',
        rshift: 'ShiftRight',
        lshift: 'ShiftLeft',
        subtract: '-',
        backslash: '\\',
        comma: ',',
        apostrophe: '\'',
        period: '.',
        slash: '/',
        backquote: '`',
        minus: '-',
        equals: '=',
        pgup: 'Page Up',
        pgdown: 'Page Down',
        backspace: "🡸 Backspace",
        up: "🢁",
        down: "🢃",
        left: "🡸",
        right: "🢂",
        multiply: "*",
        add: "+",
        divide: "/",
    };
    const rawTokens = {
        kb1_: '',
        js1_: '',
        gp1_: '',
        mo1_: '',
        np_: 'Num '
    };

    function normalizeKeybind(k)
    {
        if (!k) return;
        for (const [pattern, replacement] of Object.entries(rawTokens))
        {
            k = k.replace(new RegExp(pattern, 'gi'), replacement);
        }

        k = k.replace(
            new RegExp(`\\b(${ Object.keys(replacements).join('|') })\\b`, 'gi'),
            match => replacements[match.toLowerCase()] || match
        );

        return k.trim();
    }

    // If device label exists, add it as its own key first
    if (deviceLabel)
    {
        const deviceDiv = document.createElement('span');
        deviceDiv.classList.add('key', 'key--device');
        deviceDiv.textContent = deviceLabel;
        container.appendChild(deviceDiv);

        const colon = document.createElement('span');
        colon.textContent = ' ';
        container.appendChild(colon);
    }

    keys.forEach(k =>
    {
        const keyDiv = document.createElement('span');
        let display = normalizeKeybind(k) || "";

        if (display?.trim() !== '')
        {
            keyDiv.classList.add('key');
            display = display[0].toUpperCase() + display.slice(1);
            const side = display.endsWith('Left') ? leftIndicator :
                display.endsWith('Right') ? rightIndicator : '';
            display = display.replace(/ControlLeft|ControlRight/, 'CTRL');
            display = display.replace(/ShiftLeft|ShiftRight/, 'Shift');
            display = display.replace(/AltLeft|AltRight/, 'Alt');
            keyDiv.textContent = display;

            if (side)
            {
                const indicator = document.createElement('span');
                indicator.classList.add('side-indicator');
                indicator.textContent = side;
                if (side === leftIndicator) keyDiv.prepend(indicator);
                else keyDiv.appendChild(indicator);
            }
        } else
        {
            keyDiv.classList.add('key', 'key--unbound');
            keyDiv.textContent = textValue_UNBOUND;
        }

        container.appendChild(keyDiv);

        const plus = document.createElement('span');
        plus.textContent = ' + ';
        container.appendChild(plus);
    });

    if (container.lastChild) container.removeChild(container.lastChild);

    return container;
}


function onClickKeybindElement(e)
{
    const clickedRow = e.target.closest(".keybind__row");
    if (!clickedRow) return;



    const consoleInput = clickedRow.querySelector('.keybind__consoleInput');

    // Remove selection from previous
    document.querySelector('.keybind__row--selected')?.classList.remove('keybind__row--selected');

    // Set new selection
    currentlySelectedKeybindElement = clickedRow;
    currentlySelectedKeybindElement.classList.add('keybind__row--selected');

    const b = getCurrentBindFromSelectedRow();

    if (consoleInput && document.activeElement === consoleInput)
    {
        showManualBindHelpInfo();
    } else
    {
        ShowKeybindDescription();
    }
    // Check for CTRL + ALT + click
    //get default
    const defaultBind = b.getDefaultBind();
    if (defaultBind && currentlySelectedKeybindElement === clickedRow && e.ctrlKey && e.altKey)
    {
        b.setBind(InputState.current, defaultBind.trim());
        updateBindRow();
    }
}


function navigateToRow(row)
{
    if (!row || !rowContainer) return;
    // Get the position of the row relative to the scroll container
    const rowRect = row.getBoundingClientRect();
    const containerRect = rowContainer.getBoundingClientRect();

    // Calculate the offset to center the row
    const offset = rowRect.top - containerRect.top - (containerRect.height / 2) + (rowRect.height / 2);

    // Smoothly scroll the container
    rowContainer.scrollBy({ top: offset, behavior: 'smooth' });
}

function ShowKeybindDescription()
{
    const box = keybindDescriptionText
    const desc = currentKeyBind?.getDescription();
    const listOfKeywords = currentKeyBind?.getKeywords();


    if (currentKeyBind)
    {
        box.textContent = desc;
        keybindDescriptionTags.innerHTML = '';

        listOfKeywords.forEach(keyword =>
        {
            const tag = document.createElement('span');
            tag.classList.add('descriptionTag');
            tag.textContent = keyword;
            tag.dataset.keyword = keyword;
            keybindDescriptionTags.appendChild(tag);

            const shouldBeActive =
                selectedTags.length > 0 && selectedTags.map(k => k.toLowerCase()).includes(keyword);
            tag.classList.toggle('active', shouldBeActive);
        });
        const hasPossibleConflict = checkForConflicts(currentKeyBind)
        showConflictMessage(hasPossibleConflict);
    }
}

function checkForConflicts(bindActionMap)
{
    const thisBindKey = bindActionMap.getBind()?.trim();
    const bind = bindActionMap.getBind();
    const thisBindName = bindActionMap.getActionName();

    if (!thisBindKey) return false;

    const hasConflict = actionMapsMasterList.some(item =>
    {
        const key = item.getBind()?.trim();
        if (!key) return false;
        return key === thisBindKey && item.getActionName() !== thisBindName;
    });

    return hasConflict;
}

function showConflictMessage(show)
{
    const container = document.querySelector('.footer__keybind-info');
    let msgEl = container.querySelector('.footer__conflict-msg');

    if (show)
    {
        if (!msgEl)
        {
            msgEl = document.createElement('div');
            msgEl.className = 'footer__conflict-msg';
            msgEl.innerHTML = `
    <span class="conflict-icon">ℹ️
        <span class="tooltip-text">
            Two or more actions share the same input. This doesn't necessarily indicate a problem and in most cases a conflict can be ignored.  <br>
            Toggle '<span class="tooltip-highlight">Show Conflicts</span>' to see more.</span>
    </span>
    <span class="conflict-text"> Possible Keybind Conflict</span>
`;
            container.appendChild(msgEl);
        }
    } else
    {
        if (msgEl) msgEl.remove();
    }
}
function ClearKeybindDescription()
{
    keybindDescriptionText.textContent = "";
    keybindDescriptionTags.innerHTML = '';
}

function onSubmitKeybindConsole(e)
{
    if (currentlySelectedKeybindElement)
    {
        const consoleInput = e.target.closest(".keybind__consoleInput");
        const input = consoleInput.value;
        const manualKeybind = input && input.trim() ? input.trim() : "";
        const deviceIndex = parseForDeviceIndex(manualKeybind) || 1;
        const cleanedKeybind = manualKeybind.replace(/^\s*\d+\s*:\s*/, '');
        function parseForDeviceIndex(input)
        {
            const match = input.match(/^\s*(\d+)\s*:\s*/);
            if (match)
            {
                const index = parseInt(match[1], 10);
                return isNaN(index) ? null : index;
            }
            return null;
        }
        applyKeybind(cleanedKeybind, deviceIndex, currentKeyBind);
        updateBindRow();
        consoleInput.blur();
        consoleInput.value = null;
        consoleInput.placeholder = deviceIndex + ":" + cleanedKeybind;
    }
}

function showManualBindHelpInfo()
{
    // if (InputState.current !== InputModeSelection.KEYBOARD) return;

    const descriptionText = `<h3><u>Manual Keybind Info</u></h3>
        <strong>(Optional) Device index prefix:</strong> 'n:' sets device index; useful for binding to joystick 2 for example.  No prefix = device #1. <br><br>
        Note that manually composing keybinds like this allows total freedom to construct any bind the game may permit; but it may simply not work or cause unforeseen issues.<br>
        To bind left+right mouse click together, use the custom input of 'mouse1_2'; can be used in conjunction with modifier keys.<br><br>

        <strong>Examples:</strong><br>
        '<code class="tooltip-highlight">rctrl+a</code>' → Right Ctrl + A<br>
        '<code class="tooltip-highlight">2:lctrl+lshift+pgdown</code>' → Left Ctrl + Left Shift + Page Down, on device #2<br>
        '<code class="tooltip-highlight">8:ralt+button1</code>' → Right Alt + Trigger on your 8th joystick device<br>
        '<code class="tooltip-highlight">lctrl+mouse1_2</code>' → Left Control + Left & Right Click
    `;

    const keybindDescriptionText = document.querySelector('.footer__keybind-text');
    keybindDescriptionText.innerHTML = descriptionText;
}
function onFocusConsoleInput(e)
{
    e.target.value = e.target.placeholder.trim();
}
function onLoseFocusConsoleInput(e)
{
    if (e.target)
    {
        e.target.blur();
        e.target.value = null;
    }
}


function onClickAnywhereDeselectKeybind(e)
{
    // Ignore clicks inside a keybind row or when recording is active
    if (e.target.closest('#conflictsToggle, label[for="conflictsToggle"], .slider')) return;


    if (recordingActive) return;
    if (e &&
        (e.target.closest(".keybind__row") ||
            e.target.closest(".inputType-select") ||
            e.target.closest(".searchbar-container ")
        )) return;
    const keepSelectedIf = e?.target.closest('.slider');
    if (e.targe)
    {
        return;
    }
    const tagEl = e?.target.closest('.tag, .sub-tag, .descriptionTag');
    if (tagEl)
    {
        const elKeyword = tagEl.dataset.keyword?.trim().toLowerCase();
        const selectedKeywords = currentKeyBind?.getKeywords() || [];

        // If the clicked tag matches any selected keyword, do nothing
        if (selectedKeywords.some(kw => kw.toLowerCase() === elKeyword)) return;
    }
    // Otherwise, deselect current keybind
    ClearKeybindDescription();
    document.querySelector('.keybind__row--selected')?.classList.remove('keybind__row--selected');
    currentlySelectedKeybindElement = null;
}

function onClickRecordKeybind(e)
{
    if (e.target.closest('.button-activationMode') || e.target.closest('.keybind__consoleInput')) return;
    if (currentlySelectedKeybindElement)
    {
        recordingActive = true;
        activeCapture = currentlySelectedKeybindElement;

        // Finish any previous capture

        if (activeCapture)
        {
            if (InputState.current === InputModeSelection.CONTROLLER)
            {
                pollGamepads();
            }
            else if (InputState.current === InputModeSelection.JOYSTICK)
            {
                initializeJoystickBaselines();
                pollJoysticks();
            }
            else
            {
                // finalizeCapture_Keyboard(activeCapture);
            }
        }
        activeCapture.currentKeys = new Set();
        activeCapture.currentKeysOrdered = [];
        activeCapture.disabled = true;
        activeCapture.classList.add('recording');

        // Show awaiting input in UI
        const rowDiv = activeCapture.closest('.keybind__row');
        const valueDiv = rowDiv?.querySelector('.keybind__value');
        if (valueDiv)
        {
            valueDiv.textContent = 'Awaiting input…';
            valueDiv.classList.add('awaiting');
        }

        // --- Start auto-cancel timer ---
        cancelRecordTimer(); // clear any existing timer first
        let countdown = 5; // seconds
        recordTimeout = setInterval(() =>
        {
            if (valueDiv)
            {
                valueDiv.textContent = `Awaiting input… (${ countdown })`;
            }
            if (countdown <= 0)
            {
                console.warn("No input detected — cancelling keybind recording.");
                cancelRecordBind(); // your cancel function
                clearInterval(recordTimeout);
                recordTimeout = null;
            }
            countdown--;
        }, 1000); // update every second

    }
}

function cancelRecordTimer()
{
    if (recordTimeout)
    {
        clearTimeout(recordTimeout);
        recordTimeout = null;
    }
}

function cancelRecordBind()
{
    const currentBind = getCurrentBindFromSelectedRow().getBind() || "";
    switch (InputState.current)
    {
        case InputModeSelection.CONTROLLER:
            finalizeCapture_Controller(currentBind);
            break;
        case InputModeSelection.JOYSTICK:
            finalizeCapture_Joystick(currentBind);
            break;
        case InputModeSelection.KEYBOARD:
            finalizeCapture_Keyboard(currentlySelectedKeybindElement)
            break;

        default:
            break;
    }
    finalizeCapture_Controller();
}



function onClickSelectActivationMode(e)
{
    // const selectedRow = document.querySelector('.keybind__row--selected');
    // const thisRow = e.target.closest('.keybind__row');
    // if (thisRow !== selectedRow) return;

    const btn = e.target.closest('.button-activationMode');
    if (!btn) return;

    // Remove existing dropdowns
    document.querySelectorAll('.activation-dropdown').forEach(el => el.remove());

    // Find container
    if (!rowContainer) return;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'activation-dropdown';
    dropdown.innerHTML = `
        <div data-mode="default">Default</div>
        <div data-mode="${ activationModeType.PRESS }">Press</div>
        <div data-mode="${ activationModeType.PRESS_QUICKER }">Fast Press</div>
        <div data-mode="${ activationModeType.PRESS_MEDIUM }">Press when held (short)</div>
        <div data-mode="${ activationModeType.PRESS_EXTRA_MEDIUM }">Press when held (medium)</div>
        <div data-mode="${ activationModeType.PRESS_LONG }">Press when held (long)</div>
        <div data-mode="${ activationModeType.TAP }">Tap</div>
        <div data-mode="${ activationModeType.TAP_QUICKER }">Fast Tap</div>
        <div data-mode="${ activationModeType.DOUBLETAP_NONBLOCKING }">Double Tap (Non-Blocking)</div>
        <div data-mode="${ activationModeType.DOUBLETAP_BLOCKING }">Double Tap (Blocking)</div>
        <div data-mode="${ activationModeType.HELD }">Hold</div>
        <div data-mode="${ activationModeType.HOLD_SHORT }">Hold (Short)</div>
        <div data-mode="${ activationModeType.HOLD_LONG }">Hold (Long)</div>
        <div data-mode="${ activationModeType.HOLD_NO_RETRIGGER }">Hold (No Retrigger)</div>
        <div data-mode="${ activationModeType.ALL }">Any/All</div>
        <div data-mode="${ activationModeType.HOLD_TOGGLE }">Hold Toggle</div>
        <div data-mode="${ activationModeType.SMART_TOGGLE }">Smart Toggle</div>
    `;

    rowContainer.appendChild(dropdown);

    // Position relative to container using offsetParent math
    function positionDropdown()
    {
        const btnRect = btn.getBoundingClientRect();
        const containerRect = rowContainer.getBoundingClientRect();
        const offsetTop = btnRect.bottom - containerRect.top + rowContainer.scrollTop + 4;
        const offsetLeft = btnRect.left - containerRect.left + rowContainer.scrollLeft;
        dropdown.style.top = `${ offsetTop }px`;
        dropdown.style.left = `${ offsetLeft }px`;
    }

    positionDropdown();

    // Reposition on scroll/resize
    const reposition = () => positionDropdown();
    rowContainer.addEventListener('scroll', reposition);
    window.addEventListener('resize', reposition);

    // Handle selection
    dropdown.querySelectorAll('div').forEach(item =>
    {
        item.addEventListener('click', () =>
        {
            const bindObject = actionMapsMasterList?.find(
                a => a?.getActionName() === currentlySelectedKeybindElement?.dataset.actionName
            );

            const selectedActivationMode = item.dataset.mode === "default" ? bindObject.getDefaultActivationMode(InputState.current) : item.dataset.mode;

            if (bindObject)
            {
                bindObject.setActivationMode(selectedActivationMode, InputState.current);
                onUserChangedBind(bindObject);
                setActivationModeButtonIcon(btn, bindObject);
            }

            cleanup();
        });
    });

    // Close on outside click
    const closeDropdown = ev =>
    {
        if (!dropdown.contains(ev.target) && ev.target !== btn) cleanup();
    };
    setTimeout(() => document.addEventListener('click', closeDropdown), 0);

    // Cleanup
    function cleanup()
    {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
        rowContainer.removeEventListener('scroll', reposition);
        window.removeEventListener('resize', reposition);
    }
}


function setActivationModeButtonIcon(buttonObject, bindObject)
{
    buttonObject.innerHTML = '';
    const activationMode = bindObject.getActivationMode() ? bindObject.getActivationMode() : bindObject.getDefaultActivationMode();
    const icon = document.createElement('img');
    icon.classList.add('activation-icon');

    const iconFileName = activationMode ? activationMode : `press`;
    icon.src = `./assets/tapIcons/icon_${ iconFileName }.svg`

    let tt_text = "";
    switch (activationMode)
    {
        case activationModeType.PRESS:
            tt_text = "Press the key/button"
            break;
        case activationModeType.PRESS_QUICKER:
            tt_text = "Press or tap"
            break;
        case activationModeType.PRESS_SHORT:
            tt_text = "Like 'Press' but only if held >0.15s"
            break;
        case activationModeType.PRESS_MEDIUM:
            tt_text = "Like 'Press' but only if held >0.25s"
            break;
        case activationModeType.PRESS_EXTRA_MEDIUM:
            tt_text = "Like 'Press' but only if held >0.5s"
            break;
        case activationModeType.PRESS_LONG:
            tt_text = "Like 'Press' but only if held >1.5s"
            break;
        case activationModeType.TAP:
            tt_text = "Press & release quickly"
            break;
        case activationModeType.TAP_QUICKER:
            tt_text = "Press & release very quickly"
            break;
        case activationModeType.DOUBLETAP_BLOCKING:
            tt_text = "Tap twice, blocks initial tap if double tap is registered."
            break;
        case activationModeType.DOUBLETAP_NONBLOCKING:
            tt_text = "Tap twice, allows initial tap."
            break;
        case activationModeType.HELD:
            tt_text = "Hold to continue activating."
            break;
        case activationModeType.HOLD_SHORT:
            tt_text = "Like Hold, but with a 0.25s delay."
            break;
        case activationModeType.HOLD_LONG:
            tt_text = "Like Hold, but with a 1.5s delay."
            break;
        case activationModeType.HOLD_NO_RETRIGGER:
            tt_text = "IDK?"
            break;
        case activationModeType.HOLD_LONG_NO_RETRIGGER:
            tt_text = "IDK??"
            break;
        case activationModeType.ALL:
            tt_text = "Any/all activation modes combined."
            break;
        case activationModeType.HOLD_TOGGLE:
            tt_text = "Hold/Release to activate/deactivate."
            break;
        case activationModeType.SMART_TOGGLE:
            tt_text = "Tap to toggle, hold/release to activate/deactivate."
            break;
        default:
            break;
    }
    const activationModeParsed = activationMode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    icon.alt = activationMode;
    buttonObject.title = `${ activationModeParsed }:  ${ tt_text }`;

    // Add to the div
    buttonObject.appendChild(icon);
}

function onClickClearKeybind()
{
    const bind = actionMapsMasterList?.find(a => a?.getActionName() === currentlySelectedKeybindElement?.dataset.actionName);
    if (bind)
    {
        // Get the row in the DOM that of the corresponding keybind
        const selector = `.keybind__row[data-action-name="${ CSS.escape(bind.getActionName()) }"]`;
        const rowDiv = document.querySelector(selector);
        if (!rowDiv) return;

        // Update the displayed value
        const valueDiv = rowDiv.querySelector('.keybind__value');
        bind.clearBind();

        // If this row was currently capturing, cancel it
        if (activeCapture && activeCapture.closest('.keybind__row') === rowDiv)
        {
            activeCapture.currentKeys = new Set();
            activeCapture.currentKeysOrdered = [];
            activeCapture = null;
        }

        updateBindRow(rowDiv);
    }
}


function onClickFilterTag(e)
{
    if (e.target.closest('.tag') || e.target.closest('.sub-tag') || e.target.closest('.descriptionTag'))
    {
        // Toggle selection: deselect if already active
        const keyword = e.target.dataset.keyword;
        const isAlreadyActive = selectedTags.includes(keyword);
        selectedTags = isAlreadyActive ? [] : [keyword];
        filterByTag(e.target);
    }
}

function filterByTag(tag)
{
    if (keybindSearch) keybindSearch.value = '';

    let tagClass = '.tag';
    if (tag.classList.contains('sub-tag')) tagClass = '.sub-tag';
    else if (tag.classList.contains('descriptionTag')) tagClass = '.descriptionTag';

    // Gather all tags of all types
    const allTagDivs = [
        ...tagContainer.querySelectorAll('.tag'),
        ...subTagContainer.querySelectorAll('.sub-tag'),
        ...keybindDescriptionTags.querySelectorAll('.descriptionTag')
    ];

    // Toggle .active
    allTagDivs.forEach(tagDiv =>
    {
        const tagKeyword = tagDiv.dataset.keyword?.trim().toLowerCase();
        const shouldBeActive =
            selectedTags.length > 0 && selectedTags.map(k => k.toLowerCase()).includes(tagKeyword);
        tagDiv.classList.toggle('active', shouldBeActive);
    });

    updatefilteredNames();

    // Handle sub-tags
    if (tagClass === '.tag')
    {
        const currentTag = tag.dataset.keyword;
        const existingWrapper = subTagContainer.querySelector('.subTag-column');
        const existingTag = existingWrapper?.dataset.for;


        // CASE 1: same tag clicked again → hide
        if (existingWrapper && existingTag === currentTag)
        {
            hideSubcategoryTags();
            return;
        }

        // CASE 2: a different tag clicked → swap smoothly
        else if (existingWrapper && existingTag !== currentTag)
        {

            // Temporarily speed up transition (3x faster)
            existingWrapper.style.transition = "height 0.1s ease, opacity 0.1s ease";

            hideSubcategoryTags();

            // Show new subtags sooner (after faster transition)
            setTimeout(() =>
            {
                // restore normal transition for next time
                existingWrapper.style.transition = "";
                onShowSubcategoryTags();
            }, 100); // 100ms instead of 300ms
            return;
        }


        // CASE 3: nothing open yet → just show
        else if (!existingWrapper)
        {
            onShowSubcategoryTags();
        }
    }
}

// returns a Promise that resolves when hide animation finished (or immediately if nothing to hide)
function hideSubcategoryTags()
{
    return new Promise(resolve =>
    {
        const wrapper = subTagContainer.querySelector('.subTag-column');
        if (!wrapper) return resolve();

        // If height is 'auto', set it to current pixel height as a starting point
        const startH = wrapper.scrollHeight;
        wrapper.style.height = startH + 'px';

        // Force layout so the browser registers the explicit starting height
        void wrapper.offsetHeight;

        // Trigger the closing animation
        wrapper.style.height = '0px';
        wrapper.style.opacity = '0';

        // Remove after the height transition finishes
        const onEnd = (e) =>
        {
            if (e.target !== wrapper || e.propertyName !== 'height') return;
            wrapper.removeEventListener('transitionend', onEnd);
            if (wrapper.parentElement) wrapper.parentElement.removeChild(wrapper);
            resolve();
        };
        wrapper.addEventListener('transitionend', onEnd);

        // Safety fallback in case transitionend doesn't fire (very rare)
        setTimeout(() =>
        {
            if (subTagContainer.contains(wrapper))
            {
                wrapper.remove();
            }
            resolve();
        }, 120);
    });
}


function onShowSubcategoryTags()
{
    const currentTag = selectedTags[0];
    if (!currentTag) return;

    const subcategories = {
        Vehicle: ["Salvage", "Mining", "Turrets", "Defences", "Weapons", "Power", "Systems", "MFDs", "Movement", "Targeting", "Vehicle - Other"],
        "On Foot": ["EVA", "Combat", "Emotes", "Equipment", "On Foot - Other"],
        "Comms/Social": ["FOIP/VOIP", "Emotes", "Comms - Other"],
        "Other": ["MobiGlas", "Interaction", "Optical Tracking", "Spectator"]
    };

    const parentTag = document.querySelector(`.tag[data-keyword="${ currentTag }"]`);
    if (!parentTag) return;

    // measure relative to tag container
    const parentRect = parentTag.getBoundingClientRect();
    const containerRect = subTagContainer.getBoundingClientRect();
    const offsetLeft = parentRect.left - containerRect.left;

    // create and align
    const wrapper = document.createElement('div');
    wrapper.classList.add('subTag-column');
    wrapper.dataset.for = currentTag;
    wrapper.style.marginLeft = `${ offsetLeft }px`;

    subcategories[currentTag]?.forEach(keyword =>
    {
        const tag = document.createElement('div');
        tag.classList.add('tag', 'sub-tag');
        tag.textContent = keyword;
        tag.dataset.keyword = keyword;
        wrapper.appendChild(tag);
    });

    if (subcategories[currentTag]?.length > 0)
    {
        subTagContainer.appendChild(wrapper);
    }

    // Animate open
    requestAnimationFrame(() =>
    {
        wrapper.style.height = wrapper.scrollHeight + 'px';
        wrapper.style.opacity = '1';
    });
}


async function onClickExportKeybinds()
{
    const profileName = await promptExportKeybinds();
    if (!profileName) return; // cancelled
    bindingsProfileName = profileName;
    const xmlOutput = exportMappedActionsToXML(actionMapsMasterList);
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${ profileName }.xml`;
    link.click();
}

async function onClickImportKeybinds()
{
    // 1️⃣ Prompt user to select XML file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xml";
    input.click();

    // 2️⃣ Wait for user to pick a file
    const file = await new Promise((resolve, reject) =>
    {
        input.onchange = () => resolve(input.files[0]);
        input.onerror = reject;
    });

    if (!file)
    {
        console.warn("No file selected.");
        return;
    }

    // 3️⃣ Parse selected file into imported keybinds
    const newKeybinds = await importCustomKeybindsXML(file);
    // if (!newKeybinds || newKeybinds.length === 0)
    // {
    //     alert("No valid keybinds found in the selected file.");
    //     return;
    // }

    // // 4️⃣ Merge imported binds into existing list
    // const mergedList = mergeKeybinds(actionMapsMasterList, newKeybinds);

    // // 5️⃣ Mutate the global const array in place (don’t reassign)
    // actionMapsMasterList.length = 0;          // clear existing
    // actionMapsMasterList.push(...mergedList); // repopulate with merged result

    // // 6️⃣ Refresh UI
    showAllBinds();

}

function mergeKeybinds(existingList, importedList)
{
    const map = new Map();

    // Index existing actions by actionName
    for (const act of existingList)
    {
        map.set(act.actionName, act);
    }

    // Merge imported over existing
    for (const imported of importedList)
    {
        const existing = map.get(imported.actionName);

        if (!existing)
        {
            // Action doesn't exist in old list → add it
            map.set(imported.actionName, imported);
            continue;
        }

        // Action exists → merge only non-empty binds
        for (const mode of Object.values(InputModeSelection))
        {
            const newBind = imported.getBind(mode);
            const newMode = imported.getActivationMode(mode);

            if (newBind && newBind.trim() !== "")
            {
                existing.setBind(mode, newBind);
                if (newMode)
                {
                    existing.setActivationMode(newMode, mode);
                }
            }
        }
    }

    return Array.from(map.values());
}


async function promptExportKeybinds(defaultName = "CustomKeybinds")
{
    return new Promise(resolve =>
    {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
  <div class="confirm-box">
    <p class="exportWarning"><b>TIP:</b> Back up your SC keybinds by exporting them using the in-game menu or console command: <code class="tooltip-highlight">pp_rebindkeys export all yourfilenamehere</code> before using Star Binder.</p><br><div>Keybinds filename:</div>
    <input 
      type="text" 
      class="export-input" 
      value="${ defaultName || 'StarBinder' }"
      placeholder="Profile name..."
      style="width: 100%; margin: 8px 0; padding: 6px;"
    />
    <div class="confirm-buttons">
      <button class="btn-yes">Export</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  </div>
`;
        document.body.appendChild(modal);

        const input = modal.querySelector('.export-input');
        input.focus();
        input.select();

        modal.querySelector('.btn-yes').addEventListener('click', () =>
        {
            const name = input.value.trim() || defaultName || 'x';
            modal.remove();
            resolve("StarBinder_" + name);
        });

        modal.querySelector('.btn-cancel').addEventListener('click', () =>
        {
            modal.remove();
            resolve(null);
        });

        // Support pressing Enter or Escape
        input.addEventListener('keydown', e =>
        {
            if (e.key === 'Enter')
            {
                e.preventDefault();
                modal.querySelector('.btn-yes').click();
            }
            else if (e.key === 'Escape')
            {
                e.preventDefault();
                modal.querySelector('.btn-cancel').click();
            }
        });
    });
}


async function onClickClearAllKeybinds()
{
    const ok = await confirmClearAllKeybinds(`Are you sure you want to clear all ${ InputState.current } binds?`);
    if (!ok) return;

    actionMapsMasterList.forEach(a => a.clearBind());
    updatefilteredNames();
}

async function confirmClearAllKeybinds(message)
{
    return new Promise(resolve =>
    {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
  <div class="confirm-box">
    <p>${ message }</p>
    <div class="confirm-buttons">
      <button class="btn-yes">Yes, I'm sure</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  </div>
`;
        document.body.appendChild(modal);

        const btnYes = modal.querySelector('.btn-yes');
        const btnCancel = modal.querySelector('.btn-cancel');

        btnYes.addEventListener('click', () =>
        {
            modal.remove();
            resolve(true);
        });

        btnCancel.addEventListener('click', () =>
        {
            modal.remove();
            resolve(false);
        });

        // Handle Enter/Escape keys safely
        modal.addEventListener('keydown', e =>
        {
            if (e.key === 'Enter')
            {
                e.preventDefault();
                btnYes.click();
            }
            else if (e.key === 'Escape')
            {
                e.preventDefault();
                btnCancel.click();
            }
        });

        // Focus first button and enable key events
        btnCancel.focus();
        modal.tabIndex = -1;
        modal.focus();
    });
}


function getCurrentBindFromSelectedRow()
{
    const actionName = currentlySelectedKeybindElement?.dataset.actionName;
    if (actionName)
    {
        currentKeyBind = actionMapsMasterList.find(a => a.getActionName() === actionName);
        return currentKeyBind
    }
    else return "";
}



///////////////////////////////     GAMEPAD TYPE SHIT     ///////////////////////////////

let gamepadPollId = null;

function pollGamepads()
{
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gamepads)
    {
        if (!gp) continue;


        const DEADZONE = 0.5; // tweak sensitivity
        let stickDirection = null;

        // Left stick
        const lx = gp.axes[0];
        const ly = gp.axes[1];

        if (Math.abs(lx) > DEADZONE || Math.abs(ly) > DEADZONE)
        {
            // Determine dominant axis (horizontal vs vertical)
            if (Math.abs(lx) > Math.abs(ly))
            {
                // Horizontal movement
                stickDirection = lx > 0 ? ["thumbl", "right"] : ["thumbl", "left"];
            } else
            {
                // Vertical movement
                stickDirection = ly > 0 ? ["thumbl", "down"] : ["thumbl", "up"];
            }

            // console.log(`Left stick moved ${ stickDirection }`);
            gamepadPollId = stickDirection;
        }

        // Right stick
        const rx = gp.axes[2];
        const ry = gp.axes[3];

        if (Math.abs(rx) > DEADZONE || Math.abs(ry) > DEADZONE)
        {
            // Determine dominant axis (horizontal vs vertical)
            if (Math.abs(rx) > Math.abs(ry))
            {
                // Horizontal movement
                stickDirection = rx > 0 ? ["thumbr", "right"] : ["thumbr", "left"];
            } else
            {
                // Vertical movement
                stickDirection = ry > 0 ? ["thumbr", "down"] : ["thumbr", "up"];
            }

            // console.log(`Right stick moved ${ stickDirection }`);
            gamepadPollId = stickDirection.join("_");
        }

        // Example: any button press
        gp.buttons.forEach((button, index) =>
        {
            if (button.pressed)
            {
                gamepadPollId = `${ index }`;
                console.log(`Button ${ parseGamepadInputToStarCitizenBind(gamepadPollId) } pressed`);
            }
        });
        if (gamepadPollId)
        {
            const inputArr = parseGamepadInputToStarCitizenBind(gamepadPollId)
            finalizeCapture_Controller(inputArr, 1);
            return
        }
    }

    requestAnimationFrame(pollGamepads);
}

// Later, to stop polling:
function stopPollingGamepads()
{
    if (gamepadPollId !== null)
    {
        cancelAnimationFrame(gamepadPollId);
        gamepadPollId = null;
    }
}

function parseGamepadInputToStarCitizenBind(input)
{
    if (input)
    {
        const gampepadDictionary = {
            "0": "A",
            "1": "B",
            "2": "X",
            "3": "Y",
            "4": "shoulderl",
            "5": "shoulderr",
            "6": "trigerl_btn",
            "7": "trigerr_btn",
            "8": "back",
            "9": "start",
            "10": "thumbl",
            "11": "thumbr",
            "12": "dpad_up",
            "13": "dpad_down",
            "14": "dpad_left",
            "15": "dpad_right",
        }
        return gampepadDictionary[input] ?? input
    }
}

///////////////////////////////     JOYSTICK TYPE SHIT     ///////////////////////////////

let joystickPollId = null;

// Global persistent state
if (!window._prevGamepadStates) window._prevGamepadStates = [];
if (!window._sliderBaseline) window._sliderBaseline = [];

// Track left/right modifiers
const modifiers = {
    ctrl: { left: false, right: false },
    shift: { left: false, right: false },
    alt: { left: false, right: false }
};

window.addEventListener('keydown', e =>
{
    const loc = e.location; // 1 = left, 2 = right
    switch (e.key)
    {
        case 'Control':
            if (loc === 1) modifiers.ctrl.left = true;
            else if (loc === 2) modifiers.ctrl.right = true;
            break;
        case 'Shift':
            if (loc === 1) modifiers.shift.left = true;
            else if (loc === 2) modifiers.shift.right = true;
            break;
        case 'Alt':
            if (loc === 1) modifiers.alt.left = true;
            else if (loc === 2) modifiers.alt.right = true;
            break;
    }
});

window.addEventListener('keyup', e =>
{
    const loc = e.location;
    switch (e.key)
    {
        case 'Control':
            if (loc === 1) modifiers.ctrl.left = false;
            else if (loc === 2) modifiers.ctrl.right = false;
            break;
        case 'Shift':
            if (loc === 1) modifiers.shift.left = false;
            else if (loc === 2) modifiers.shift.right = false;
            break;
        case 'Alt':
            if (loc === 1) modifiers.alt.left = false;
            else if (loc === 2) modifiers.alt.right = false;
            break;
    }
});


function pollJoysticks()
{
    const joysticks = navigator.getGamepads ? navigator.getGamepads() : [];
    const DEADZONE = 0.02; // general small threshold to ignore noise

    for (let gp of joysticks)
    {
        if (!gp) continue;

        let joystickPollId = null;

        // Helper to assign input consistently
        const setInput = (input) => ({
            device: gp.index + 1,
            input
        });

        // --- Initialize previous state and slider baseline ---
        if (!window._prevGamepadStates[gp.index])
        {
            window._prevGamepadStates[gp.index] = {
                axes: [...gp.axes],
                buttons: gp.buttons.map(b => b.pressed)
            };
        }

        if (!window._sliderBaseline[gp.index])
        {
            window._sliderBaseline[gp.index] = gp.axes[6]; // slider resting value
        }

        const prev = window._prevGamepadStates[gp.index];

        // --- Axes: sticks, twist, hat, sliders ---
        gp.axes.forEach((value, i) =>
        {
            const prevVal = prev.axes[i] || 0;
            if (Math.abs(value - prevVal) > DEADZONE)
            {
                console.log(`Device ${ gp.index }: Axis ${ i } = ${ value.toFixed(2) }`);

                // Left stick (axes 0 & 1)
                if (i === 0 || i === 1)
                {
                    const lx = gp.axes[0], ly = gp.axes[1];
                    if (Math.abs(lx) > DEADZONE || Math.abs(ly) > DEADZONE)
                    {
                        const stickDirection =
                            Math.abs(lx) > Math.abs(ly) ? lx > 0 ? "right" : "left" : ly > 0 ? "down" : "up";
                        joystickPollId = setInput(stickDirection);
                    }
                }

                // Twist axis
                else if (i === 5 && Math.abs(value) > DEADZONE)
                {
                    const twistDir = value > 0 ? "+" : "-";
                    // joystickPollId = setInput(["rotz", twistDir]);
                    joystickPollId = setInput("rotz");
                }

                // Hat switch (axis 9 in your case)
                else if (i === 9)
                {
                    let direction = null;
                    if (value < -0.5) direction = "up";
                    else if (value > 0.5) direction = "left";  // example, adjust based on your logs
                    else if (value > 0) direction = "down";
                    else if (value < 0) direction = "right";

                    if (direction)
                    {
                        joystickPollId = setInput("hat" + (gp.index + 1) + "_" + direction);
                    }
                }
                //slider
                else if (i === 6)
                {
                    const baseline = window._sliderBaseline[gp.index];
                    if (Math.abs(value - baseline) > DEADZONE)
                    {
                        const direction = value > baseline ? "down" : "up";
                        // joystickPollId = setInput("slider", direction);
                        joystickPollId = setInput("slider" + (gp.index + 1));
                        console.log(
                            `Device ${ gp.index }: Slider moved ${ direction } (baseline ${ baseline.toFixed(2) }, current ${ value.toFixed(2) })`
                        );
                    }
                }
                else
                {
                    console.log(`UNKNOWN AXIS DEBUG: Axis: ${ i } Value: ${ value }`);
                    const lx = gp.axes[i]
                    if (Math.abs(lx) > DEADZONE)
                    {
                        const stickDirection = lx > 0 ? "pos" : "neg";
                        joystickPollId = setInput("unknown input: " + i + "_" + stickDirection);
                    }
                }
            }
        });

        // --- Buttons ---
        gp.buttons.forEach((button, i) =>
        {
            const prevPressed = prev.buttons[i] || false;
            if (button.pressed !== prevPressed)
            {
                console.log(
                    `Device ${ gp.index }: Button ${ i } ${ button.pressed ? "pressed" : "released" }`
                );
            }
            if (button.pressed)
            {
                const joybtn = parseInt(i, 10) + 1;
                joystickPollId = setInput(`${ joybtn }`);
            }

        });

        // --- Update previous state for next frame ---
        window._prevGamepadStates[gp.index].axes = [...gp.axes];
        window._prevGamepadStates[gp.index].buttons = gp.buttons.map(b => b.pressed);

        // --- Capture first meaningful input ---
        if (joystickPollId)
        {

            const heldMods = [];
            ['ctrl', 'shift', 'alt'].forEach(key =>
            {
                if (modifiers[key].left) heldMods.push(`l${ key }`);
                if (modifiers[key].right) heldMods.push(`r${ key }`);
            });
            const joystickInput = parseJoystickInputToStarCitizenBind(joystickPollId.input);
            const inputArr = heldMods.length > 0
                ? heldMods.join('+') + '+' + joystickInput
                : joystickInput;
            finalizeCapture_Joystick(inputArr, joystickPollId.device);
            return; // stop polling until next frame
        }
    }

    requestAnimationFrame(pollJoysticks);
}

// Called once when you start listening for input
function initializeJoystickBaselines()
{
    const gps = navigator.getGamepads();
    if (!gps) return;

    window._sliderBaseline = [];
    window._prevGamepadStates = [];

    gps.forEach((gp, index) =>
    {
        if (!gp) return;
        window._prevGamepadStates[index] = {
            axes: [...gp.axes],
            buttons: gp.buttons.map(b => b.pressed)
        };
        window._sliderBaseline[index] = gp.axes[6]; // store initial resting slider value
        // console.log(`Device ${ index }: slider baseline = ${ gp.axes[6].toFixed(2) }`);
    });
}



// Later, to stop polling:
function stopPollingJoysticks()
{
    if (joystickPollId !== null)
    {
        cancelAnimationFrame(joystickPollId);
        joystickPollId = null;
    }
}

function parseJoystickInputToStarCitizenBind(input)
{
    if (input)
    {
        if (/^\d/.test(input))
        {
            return 'button' + input;
        }
        else
        {
            return input;
        }
    }
}



/////////////////////////////////////////////

function serializeMappedAction(action)
{
    return {
        actionName: action.actionName,
        binds: Object.fromEntries(
            Object.entries(action.bind).map(([mode, b]) => [
                mode,
                { input: b.input, deviceIndex: b.deviceIndex, activationMode: b.activationMode }
            ])
        )
    };
}

function deserializeMappedAction(data, existingAction)
{
    for (const [mode, bindData] of Object.entries(data.binds))
    {
        if (existingAction.bind[mode])
        {
            existingAction.bind[mode].input = bindData.input;
            existingAction.bind[mode].deviceIndex = bindData.deviceIndex;
            existingAction.bind[mode].activationMode = bindData.activationMode;
        }
    }
}
function saveUserChanges()
{
    const savedActions = actionMapsMasterList.map(serializeMappedAction);
    localStorage.setItem("userMappedActions", JSON.stringify(savedActions));
}
async function loadMappedActions()
{
    const baseActions = await loadAndParseDataminedXML();

    const savedJson = localStorage.getItem("userMappedActions");
    if (savedJson)
    {
        const savedActions = JSON.parse(savedJson);

        savedActions.forEach(saved =>
        {
            const action = baseActions.find(a => a.actionName === saved.actionName);
            if (action)
            {
                deserializeMappedAction(saved, action);
            }
        });
    }

    return baseActions;
}
function onUserChangedBind(actionObject)
{
    const newInput = actionObject.getBind()
    const newDeviceIndex = actionObject.getBindDevice();
    const newActivationMode = actionObject.getActivationMode();
    actionObject.bind[InputState.current].input = newInput;
    actionObject.bind[InputState.current].deviceIndex = newDeviceIndex;
    actionObject.bind[InputState.current].activationMode = newActivationMode;
    saveUserChanges();
}
async function initActionMaps()
{
    const actions = await loadAndParseDataminedXML();

    const savedJson = localStorage.getItem("userMappedActions");
    if (savedJson)
    {
        const savedActions = JSON.parse(savedJson);
        savedActions.forEach(saved =>
        {
            const action = actions.find(a => a.actionName === saved.actionName);
            if (action)
            {
                // Apply saved user changes
                for (const [mode, bindData] of Object.entries(saved.binds))
                {
                    if (action.bind[mode])
                    {
                        action.bind[mode].input = bindData.input;
                        action.bind[mode].deviceIndex = bindData.deviceIndex;
                        action.bind[mode].activationMode = bindData.activationMode;
                    }
                }
            }
        });
    }

    return actions;
}
async function loadAndMergeMappedActions()
{
    // 1. Load baseline XML
    const baseActions = await loadAndParseDataminedXML();

    // 2. Merge saved user changes if available
    const savedJson = localStorage.getItem("userMappedActions");
    if (savedJson)
    {
        const savedActions = JSON.parse(savedJson);

        savedActions.forEach(saved =>
        {
            const action = baseActions.find(a => a.actionName === saved.actionName);
            if (action)
            {
                deserializeMappedAction(saved, action);
            }
        });
    }

    // 3. Update master list for the rest of your code to use
    actionMapsMasterList.length = 0; // clear
    baseActions.forEach(a => actionMapsMasterList.push(a));

    return actionMapsMasterList;
}
