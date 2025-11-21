import { presetData } from './presets/presets.js';
import { mappedActionSource } from './MappedActions.js';
// import { MappedAction } from './classes/MappedAction.js';

const SPLASH_VERSION = "0.0.1";
//#region Keybind Values

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
    "Space": "space",
    "Tab": "tab",
    "Escape": "escape",

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

    //  numbers
    "Digit0": "0",
    "Digit1": "1",
    "Digit2": "2",
    "Digit3": "3",
    "Digit4": "4",
    "Digit5": "5",
    "Digit6": "6",
    "Digit7": "7",
    "Digit8": "8",
    "Digit9": "9",

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
    const desc = actionMapDictionary[key]?.description;

    if (!desc || desc.startsWith("@"))
    {
        return key + ": No description available.";
    }

    return desc;
}

function getActionKeywords(key)
{
    return actionMapDictionary[key]?.keywords ?? [];
}
function getActionIsRelative(key)
{
    return actionMapDictionary[key]?.relative ?? false;
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

    output = output
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return output;
}


//#endregion





//#region Global Vars

// const actionMapsMasterList = [];
let connectedDevices = {};
let localisationData = null;
let localisedLanguage = "english"


let bindMode = "binder";

let bindingsProfileName = "StarBinder"

const keybindSearch = document.getElementById(`keybindSearch`);

const btnKeybindSearch = document.querySelector('.searchbar-button');
const btnKeybindSearchClear = document.querySelector('.searchbar-clear');
const rowContainer = document.querySelector('.content-keybinds');
const tagContainer = document.getElementById('tagContainer')
const subTagContainer = document.getElementById('subTagContainer')

const navBar = document.querySelector('.top-navbar');
const modeToggle = document.querySelector(".mode-toggle");
const btnBinder = navBar.querySelector('[data-action="binder"]')
const btnPresets = navBar.querySelector('.presetsButton');

const popout = document.querySelector('.popout-navbar');
const popoutInner = document.querySelector('.popout-navbar-inner');
const presetSections = document.getElementById('presetSections');
const presetDescription = document.querySelector('.preset-description');

const inputSelectButtonsDiv = document.querySelector('.inputType-select');
const btnSelectInput_Keyboard = document.querySelector('.button-inputSelect-keyboard');
const btnSelectInput_Controller = document.querySelector('.button-inputSelect-controller');
const btnSelectInput_Joystick = document.querySelector('.button-inputSelect-joystick');
// const btnSelectInput_JoystickModelSelect = document.querySelector('.button-inputSelect-joystickModelSelect');


const joystickDropdownRow = document.querySelector('.joystick-dropdown-row');

const footer = document.querySelector('.footer');
const keybindDescriptionDiv = document.querySelector('.footer__keybind-info');
const keybindDescriptionText = keybindDescriptionDiv.querySelector('.footer__keybind-text');
const keybindDescriptionTags = keybindDescriptionDiv.querySelector('.footer__keybind-tags');
const footerButtonsDiv = footer.querySelector('.footer__buttons');

const splashModalMain = document.getElementById('splashModal');
const splashModal = splashModalMain.querySelector('.modal-content');
const splashHelpImage = splashModal.querySelector('.quickstart-image')
const splashHelpImageTitle = splashModal.querySelector('.quickstart-image-title')
const helpModalCheckbox = document.getElementById('hideModalCheckbox');

const conflictsToggle = document.getElementById('conflictsToggle');
const boundActionsToggle = document.getElementById('boundActionsToggle');
let showBoundActionsState = 0;

const attributionsSection = document.getElementById("attributions");

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
    SMART_TOGGLE: 'smart_toggle',
    NONE: 'none'
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
    "@ui_CGOpticalTracking": ["other", "optical tracking", "foip/voip"],
    "player_input_optical_tracking": ["other", "optical tracking", "foip/voip"],
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
            // console.log("Error with category name:", k, _name);
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
    UIdescription;
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
        UIdescription,       // "@ui_CIStrafeUpDesc"
        version,
        optionGroup,
        keyboardBindable,
        mouseBindable,
        gamepadBindable,
        joystickBindable,
    })
    {
        Object.assign(this, arguments[0]);
        this.actionMapName = mapName;

        if (this.mapName) getOrCreateActionKeywords(this.actionName).push(this.mapName);
        if (this.category) getOrCreateActionKeywords(this.actionName).push(this.category);
        if (this.UICategory) getOrCreateActionKeywords(this.actionName).push(this.UICategory);

        const keywords = new Set(resolveKeywords(getActionKeywords(this.actionName), "Action: " + this.actionName));

        //fallback for when the source XML doesn't explicitly give action as relative
        //Covers relative and absolute (absolute is for sliders etc)
        if (this.isRelative === false || !this.isRelative) this.isRelative = getActionIsRelative(this.actionName)

        keywords.forEach(k =>
        {
            if (!k.startsWith("@"))
            {
                if (k.trim() != "") this.keywordTags.push(k)
            }
        });
        this.bind[InputModeSelection.KEYBOARD].bindable = keyboardBindable;
        this.bind[InputModeSelection.MOUSE].bindable = mouseBindable;
        this.bind[InputModeSelection.CONTROLLER].bindable = gamepadBindable;
        this.bind[InputModeSelection.JOYSTICK].bindable = joystickBindable;
        if (keyboardBindable)
        {
            this.setDefaultBind(InputModeSelection.KEYBOARD, this.keyboardBind ?? this.mouseBind)
            this.setBind(InputModeSelection.KEYBOARD, this.keyboardBind ?? this.mouseBind)
            const activtationType = this.activationMode ? this.activationMode : activationModeType.NONE;
            this.setActivationMode(activtationType, InputModeSelection.KEYBOARD)
            this.setDefaultActivationMode(activtationType, InputModeSelection.KEYBOARD)
        }
        if (gamepadBindable)
        {
            this.setDefaultBind(InputModeSelection.CONTROLLER, this.gamepadBind)
            this.setBind(InputModeSelection.CONTROLLER, this.gamepadBind)
            const activtationType = this.activationMode ? this.activationMode : activationModeType.NONE;
            this.setActivationMode(activtationType, InputModeSelection.CONTROLLER)
            this.setDefaultActivationMode(activtationType, InputModeSelection.CONTROLLER)
        }
        if (joystickBindable)
        {
            this.setDefaultBind(InputModeSelection.JOYSTICK, this.joystickBind)
            this.setBind(InputModeSelection.JOYSTICK, this.joystickBind)
            const activtationType = this.activationMode ? this.activationMode : activationModeType.NONE;
            this.setActivationMode(activtationType, InputModeSelection.JOYSTICK)
            this.setDefaultActivationMode(activtationType, InputModeSelection.JOYSTICK)
        }


        // Find index of existing entry with the same actionName
        // const existingIndex = actionMapsMasterList.findIndex(a => a.actionName === this.actionName);

        // if (existingIndex >= 0)
        // {
        //     // Replace existing entry in-place
        //     actionMapsMasterList[existingIndex] = this;
        // } else
        // {
        //     // Push new entry
        //     actionMapsMasterList.push(this);
        // }

    }

    // ===== getters/setters =====
    getActionName() { return this.actionName; }
    setActionName(n) { this.actionName = n; return this; }

    getActionMapName() { return this.actionMapName; }
    setActionMapName(str) { this.actionMapName = str; return this; }

    getDescription() { return this.description; }
    setDescription(str = getActionDescription(this.getActionName()))
    {
        if (this.description !== str) this.description = str;
    }

    getKeywords() { return this.keywordTags; }
    setKeywords(keywords)
    {
        if (!keywords && this.getActionName())
        {
            keywords = getActionKeywords(this.getActionName())
        }
        if (keywords)
        {
            keywords.push(this.getActionMapName())
            this.keywordTags = keywords;
        }
    }

    getBind(state = InputState.current)
    {
        return this.bind[state].input;
    }
    setBind(state = InputState.current, bindString)
    {
        this.bind[state].input = bindString;
    }
    getDefaultBind(state = InputState.current)
    {
        return this.bind[state].defaultBind;
        // return this.bind[state][0];
    }
    setDefaultBind(state = InputState.current, bindString)
    {
        if (bindString && !this.bind[state].defaultBind && this.bind[state].defaultBind != bindString) this.bind[state].defaultBind = bindString;
    }
    getBindDevice(state = InputState.current)
    {
        // const deviceNumber = this.bind[state][1] || 1;
        const deviceNumber = this.bind[state].deviceIndex || 1;
        return deviceNumber;
    }
    setBindDevice(state = InputState.current, deviceIndex)
    {
        if (deviceIndex) this.bind[state].deviceIndex = deviceIndex;
    }


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
    clearBind(inputType = InputState.current, shouldSave = false)
    {
        //sets to a space so it's cleared in SC
        const actMode = this.getDefaultActivationMode(inputType)
        if (this.getBind != " ") this.setBind(inputType, " ")
        if (this.getActivationMode(inputType) !== actMode) this.setActivationMode(actMode, inputType)
        if (this.getBindDevice(inputType) != "1") this.setBindDevice(inputType, "1")
        if (shouldSave) onUserChangedBind(this)
    }
    resetBind(inputType = InputState.current, shouldSave = false)
    {
        //clears it entirely so it's not exported, leaving it to default
        const actMode = this.getDefaultActivationMode(inputType)
        if (this.getBind !== "") this.setBind(inputType, "")
        if (this.getActivationMode(inputType) !== actMode) this.setActivationMode(actMode, inputType)
        if (this.getBindDevice(inputType) != "1") this.setBindDevice(inputType, "1")
        if (shouldSave) onUserChangedBind(this)
    }
    resetAllBinds()
    {
        this.resetBind(InputModeSelection.KEYBOARD, false);
        this.resetBind(InputModeSelection.CONTROLLER, false);
        this.resetBind(InputModeSelection.JOYSTICK, false);
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
const actionMapsMasterList = [];


function setupRowContainerListeners()
{
    rowContainer?.addEventListener("click", onClickRowContainer);
    rowContainer?.addEventListener("dblclick", onDoubleClickRowContainer);
    rowContainer?.addEventListener("focusin", onFocusRowContainer)
    rowContainer?.addEventListener("focusout", onLoseFocusConsoleInput)
    rowContainer.addEventListener("mousedown", onHoldClearKeybind)
    rowContainer.addEventListener("mouseup", () =>
    {
        clearTimeout(holdTimer);
    });
    rowContainer?.addEventListener("keydown", function (e)
    {
        if (e.key === "Enter")
        {
            e.preventDefault();
            onSubmitKeybindConsole(e);
        }
    });
}
function onClickRowContainer(e)
{
    onClickSelectActivationMode(e);
    onClickKeybindElement(e);
}
function onDoubleClickRowContainer(e)
{
    onClickRecordKeybind(e);
}
function onFocusRowContainer(e)
{
    onClickKeybindElement(e);
    onFocusConsoleInput(e);
}
//#endregion


//#region Initialisation Function

async function init()
{
    //was for when I thought I needed per-device profiles
    // setupJoystickDropdown();
    keybindSearch.value = '';
    await keybindsJSON();

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
    const jsonPromise = loadLocalisationJSON();

    showSplashModal();

    generateMainCategoryTags();
    await initActionMaps();

    tagContainer.addEventListener('click', onClickFilterTag);
    subTagContainer.addEventListener('click', onClickFilterTag);

    btnKeybindSearch.addEventListener('click', performSearch);
    btnKeybindSearchClear.addEventListener('click', clearAllFilters);
    keybindSearch.addEventListener('keydown', (e) =>
    {
        if (e.key === 'Enter')
        {
            e.preventDefault();
            performSearch();
        }
    });

    //setup clear/import/export
    footerButtonsDiv?.addEventListener("click", onClickFooterButtons);
    boundActionsToggle.addEventListener('click', onToggleFilter_BoundActions)
    conflictsToggle.addEventListener('change', onToggleFilter_Conflicts)

    //setup keyboard/controller/joystick buttons
    inputSelectButtonsDiv?.addEventListener("click", onClickInputSelect);

    navBar?.addEventListener("click", onClickNavBar)

    renderPresetButtons();
    presetSections.addEventListener('mouseover', (e) =>
    {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;
        presetDescription.textContent = btn.dataset.desc || '';
    });
    presetSections.addEventListener('mouseout', (e) =>
    {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;

        presetDescription.textContent = '';
    });
    presetSections.addEventListener('click', (e) => { onClickLoadPreset(e) });
    popoutInner?.addEventListener('mouseenter', (e) =>
    {
        onHoverPresets(e)
    }, true);
    popoutInner?.addEventListener('mouseleave', (e) =>
    {
        onLeaveHoverPresets
    }, true);

    document.addEventListener("click", onClickAnywhereDeselectKeybind);
    document.addEventListener("click", onClickAnywhereClosePresets);
    setupRowContainerListeners();

    keybindDescriptionTags.addEventListener("click", onClickFilterTag);

    window.addEventListener("gamepadconnected", mapIndexValuesToDevices);
    window.addEventListener("gamepaddisconnected", mapIndexValuesToDevices);

    attributionsSection.addEventListener("click", onClickToggleAttributions);

    //prevent actions that interfere with Star Binder
    document.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener("keyup", function (e)
    {
        if (e.key === "Alt")
        {
            e.preventDefault();
            return false;
        }
    }, true); // use capture mode

    //search tool
    initFuse();

    if (localisedLanguage !== "english") await jsonPromise;
    btnSelectInput_Keyboard.click()
}


//#endregion

//#region Joystick Mapping

//initial mapping
function mapIndexValuesToDevices()
{
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];

    let logicalCounter = 1;

    connectedDevices = {}; // reset

    for (let pad of pads)
    {
        if (!pad) continue;

        // pad.index is the physical device's browser index
        const physicalIndex = pad.index;

        // Assign next logical number
        connectedDevices[physicalIndex] = logicalCounter;
        logicalCounter++;
    }
    updateJoystickDeviceButtons();

}

function registerDeviceToIndexValue(device, index)
{
    // device: logical number of the device to modify
    // index: new logical number we want to assign

    let physicalOfDevice = null;
    let physicalOfIndex = null;

    // Find the physical indexes of:
    // - the device we're modifying
    // - the device currently using the target index
    for (const physical in connectedDevices)
    {
        const logical = connectedDevices[physical];

        if (logical === device)
            physicalOfDevice = Number(physical);

        if (logical === index)
            physicalOfIndex = Number(physical);
    }

    // If device is not found, nothing to do
    if (physicalOfDevice == null) return;

    // If another device already has the desired index → swap their logical values
    if (physicalOfIndex != null)
    {
        // Swap
        connectedDevices[physicalOfIndex] = connectedDevices[physicalOfDevice];
    }

    // Assign the new index to the target device
    connectedDevices[physicalOfDevice] = index;
}


// When listening starts, capture baseline values once
const baselineAxes = {};
let listeningForInputAssignment = false

function onClickAssignIndexToDevice(targetIndex = 1, btn)
{
    if (listeningForInputAssignment) return;
    const timeout = 5000;
    const startTime = performance.now();

    if (btn)
    {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "Move an axis or press a button...";
    }

    // Capture baseline values for all pads ONCE
    const pads = navigator.getGamepads();
    for (let pad of pads)
    {
        if (!pad) continue;
        baselineAxes[pad.index] = [...pad.axes];
    }
    listeningForInputAssignment = true;
    function listen()
    {

        const pads = navigator.getGamepads();

        for (let pad of pads)
        {
            if (!pad) continue;

            const logicalDevice = connectedDevices[pad.index];

            // button detection
            if (pad.buttons.some(b => b.pressed))
            {
                if (btn) btn.textContent = btn.dataset.originalText;
                registerDeviceToIndexValue(logicalDevice, targetIndex);
                listeningForInputAssignment = false;
                return;
            }

            // axis movement detection (delta-based)
            const base = baselineAxes[pad.index] || pad.axes;
            for (let i = 0; i < pad.axes.length; i++)
            {
                const delta = Math.abs(pad.axes[i] - base[i]);

                // movement threshold (0.15 works great)
                if (delta > 0.15)
                {
                    if (btn) btn.textContent = btn.dataset.originalText;
                    listeningForInputAssignment = false;
                    registerDeviceToIndexValue(logicalDevice, targetIndex);
                    return;
                }
            }
        }

        if (performance.now() - startTime < timeout)
        {
            requestAnimationFrame(listen);
        }
        else if (btn)
        {
            btn.textContent = btn.dataset.originalText;
            listeningForInputAssignment = false;
        }
    }

    listen();
}

function updateJoystickDeviceButtons()
{
    const container = document.getElementById("joystickDeviceButtons");
    container.innerHTML !== '' && (container.innerHTML = '');

    // Connected devices looks like { "0":1, "1":2 }
    // We want logical numbers sorted: 1,2,3...
    const logicalDevices = Object.values(connectedDevices).sort((a, b) => a - b);

    logicalDevices.forEach(logical =>
    {
        const btn = document.createElement("button");
        btn.className = "button joystick-device-button";
        btn.type = "button";
        btn.textContent = `Set input ${ logical }`;

        btn.dataset.displayIndex = logical;
        btn.dataset.logicalDevice = logical;

        btn.addEventListener("click", () =>
        {
            // Whatever UI action you want – maybe assign index?
            onClickAssignIndexToDevice(logical, btn);
        });

        container.appendChild(btn);
    });
}


//#endregion

function onClickInputSelect(event)
{
    const btn = event.target.closest("button");
    if (!btn) return;
    if (btn === btnSelectInput_Keyboard) setInputMode(InputModeSelection.KEYBOARD);
    if (btn === btnSelectInput_Controller) setInputMode(InputModeSelection.CONTROLLER);
    if (btn === btnSelectInput_Joystick) setInputMode(InputModeSelection.JOYSTICK);
}

const inputButtons = {
    [InputModeSelection.KEYBOARD]: btnSelectInput_Keyboard,
    [InputModeSelection.CONTROLLER]: btnSelectInput_Controller,
    [InputModeSelection.JOYSTICK]: btnSelectInput_Joystick
};

function setInputMode(mode)
{
    if (activeCapture) return
    InputState.current !== mode ? InputState.set(mode) : onModeChangeUpdateUI();
    onClickBindModeToggle("binder")

    // Loop through all 3 input selection buttons and toggle the 'selected' class
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

    if (InputState.current === InputModeSelection.JOYSTICK)
    {
        if (joystickDropdownRow.classList.contains("collapsed"))
        {
            joystickDropdownRow.classList.remove("collapsed");
        }
    }
    else
    {
        //hide dropdown
        if (!joystickDropdownRow.classList.contains("collapsed"))
        {
            joystickDropdownRow.classList.add("collapsed");
        }
    }
}

//#region Splash modal

let currentHelpImageIndex = 1;
const SplashHelpImages = {
    1: { file: "binderfinder.webp", title: "Binder Finder" },
    2: { file: "presets.webp", title: "Loadable presets" },
    3: { file: "searchandfilter.webp", title: "Search & Filter" },
    4: { file: "inputsupport.webp", title: "Supports most devices" },
    5: { file: "activationmodes.webp", title: "Many Activation Modes" },
    6: { file: "importexport.webp", title: "Import & Export" },
    7: { file: "actiondescriptions.webp", title: "Actions have descriptions" },
    8: { file: "customkeybindbuilder.webp", title: "Bespoke bind editing" }
}

function compareVersion(v1, v2)
{
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(a.length, b.length); i++)
    {
        const x = a[i] || 0;
        const y = b[i] || 0;
        if (x < y) return -1;
        if (x > y) return 1;
    }
    return 0;
}


function showSplashModal()
{
    const closeBtn = document.getElementById('closeModal');

    const storedVersion = localStorage.getItem('splashVersion') || "0.0.0";

    if (compareVersion(storedVersion, SPLASH_VERSION) < 0)
    {
        helpModalCheckbox.checked = false;                // reset checkbox
        splashModalMain.style.display = 'flex';

        closeBtn.addEventListener('click', onClickCloseHelpModal);
        splashModal.addEventListener('click', onClickNavHelpImage);
        document.addEventListener("keydown", function (e)
        {
            if (e.key === "Escape")
            {
                e.preventDefault();
                onClickCloseHelpModal();
            }
            if (e.key === "ArrowLeft")
            {
                e.preventDefault();
                onClickNavHelpImage(e, "left");
            }
            if (e.key === "ArrowRight")
            {
                e.preventDefault();
                onClickNavHelpImage(e, "right");
            }
        });
        showHelpImage(1);
    }
}

function onClickCloseHelpModal()
{
    if (helpModalCheckbox.checked)
    {
        localStorage.setItem('splashVersion', SPLASH_VERSION);
    }

    splashModalMain.style.display = 'none';
}


function onClickNavHelpImage(e, dir)
{
    const maxIndex = Object.keys(SplashHelpImages).length;

    // Override dir based on the clicked element (if provided)
    if (e && e.target)
    {
        if (e.target.classList.contains('left')) dir = "left";
        if (e.target.classList.contains('right')) dir = "right";
    }

    // Apply movement
    if (dir === "left")
    {
        currentHelpImageIndex =
            ((currentHelpImageIndex - 2 + maxIndex) % maxIndex) + 1;

    } else if (dir === "right")
    {
        currentHelpImageIndex =
            (currentHelpImageIndex % maxIndex) + 1;
    }

    showHelpImage(currentHelpImageIndex);
}



function showHelpImage(n)
{
    const asset = "./assets/help/" + SplashHelpImages[n].file
    splashHelpImage.src = asset;
    splashHelpImageTitle.textContent = SplashHelpImages[n].title;
}

//#endregion

//#region XML PARSING
// ========== XML Parsing ==========
//should now be defunct.
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
        const UICategory = map.getAttribute("UILabel")


        if (excludedCategories.includes(mapName)) return;

        map.querySelectorAll("action").forEach(action =>
        {
            const actionName = action.getAttribute("name");
            const label = action.getAttribute("UILabel");
            const description = action.getAttribute("UIDescription");
            const category = action.getAttribute("Category");

            const optionGroupName = action.getAttribute("optionGroup");
            let reltiveOptionGroup = false;
            if (optionGroupName)
            {
                const optionGroupNode = findOptionGroupByName(xmlDoc, optionGroupName);
                if (optionGroupNode)
                {
                    const showCurve = getInheritedAttribute(optionGroupNode, "UIShowCurve");
                    const showInvert = getInheritedAttribute(optionGroupNode, "UIShowInvert");

                    if (showCurve === "1" && showInvert === "1")
                    {
                        reltiveOptionGroup = true;
                    }
                }
            }


            // Skip if no actionName, duplicate, no UICategory, starts with 'flashui',
            // or none of label/description/category exist
            if (
                !actionName ||
                seenActionNames.has(actionName) ||
                // !UICategory ||
                actionName.startsWith('flashui')
                || (!label && !description && !category)
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
                UIdescription: description,
                UICategory,
                isRelative: reltiveOptionGroup || null
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


function findOptionGroupByName(xmlDoc, name)
{
    return xmlDoc.querySelector(`optiongroup[name="${ name }"]`);
}

function getInheritedAttribute(node, attrName)
{
    while (node)
    {
        if (node.nodeType === 1 && node.hasAttribute(attrName))
        {
            const val = node.getAttribute(attrName);
            if (val !== null && val !== "-1") return val;
        }
        node = node.parentElement;
    }
    return null;
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
function isDefaultBind(bindObj, inputType = InputState.current)
{
    if (!bindObj) return false;

    return ((bindObj.getBind(inputType) === bindObj.getDefaultBind(inputType)) && (bindObj.getActivationMode() === bindObj.getDefaultActivationMode()))
}

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
        const keyboardBind = !isDefaultBind(action, InputModeSelection.KEYBOARD) ? action.getBind(InputModeSelection.KEYBOARD) : "";
        const mouseBind = !isDefaultBind(action, InputModeSelection.MOUSE) ? action.getBind(InputModeSelection.MOUSE) : "";
        const controllerBind = !isDefaultBind(action, InputModeSelection.CONTROLLER) ? action?.getBind(InputModeSelection.CONTROLLER) : "";
        const joystickBind = !isDefaultBind(action, InputModeSelection.JOYSTICK) ? action.getBind(InputModeSelection.JOYSTICK) : "";
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
            // const keyboardBind = action.getBind(InputModeSelection.KEYBOARD)?.trim();
            const keyboardBind = !isDefaultBind(action, InputModeSelection.KEYBOARD) ? action.getBind(InputModeSelection.KEYBOARD) : "";
            const mouseBind = !isDefaultBind(action, InputModeSelection.MOUSE) ? action.getBind(InputModeSelection.MOUSE) : "";
            const controllerBind = !isDefaultBind(action, InputModeSelection.CONTROLLER) ? action?.getBind(InputModeSelection.CONTROLLER) : "";
            const joystickBind = !isDefaultBind(action, InputModeSelection.JOYSTICK) ? action.getBind(InputModeSelection.JOYSTICK) : "";

            if (keyboardBind)
            {
                const deviceIndex = "kb" + action.getBindDevice(InputModeSelection.KEYBOARD) + "_";
                xml += `   <rebind input="${ deviceIndex }${ keyboardBind }"`;
                if (keyboardBind != " " && action.getActivationMode(InputModeSelection.KEYBOARD) && action.getActivationMode(InputModeSelection.KEYBOARD) != activationModeType.NONE) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.KEYBOARD) }"`;
                xml += `/>\n`;
            }
            if (controllerBind)
            {
                const deviceIndex = "gp" + action.getBindDevice(InputModeSelection.CONTROLLER) + "_";
                xml += `   <rebind input="${ deviceIndex }${ controllerBind }"`;
                if (controllerBind != " " && action.getActivationMode(InputModeSelection.CONTROLLER) && action.getActivationMode(InputModeSelection.CONTROLLER) != activationModeType.NONE) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.CONTROLLER) }"`;
                xml += `/>\n`;
            }
            if (joystickBind)
            {
                const deviceIndex = "js" + action.getBindDevice(InputModeSelection.JOYSTICK) + "_";
                xml += `   <rebind input="${ deviceIndex }${ joystickBind }"`;
                if (joystickBind != " " && action.getActivationMode(InputModeSelection.JOYSTICK) && action.getActivationMode(InputModeSelection.JOYSTICK) != activationModeType.NONE) xml += ` activationMode="${ action.getActivationMode(InputModeSelection.JOYSTICK) }"`;
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
// importCustomKeybindsXML(file, "preserve");
async function importCustomKeybindsXML(fileOrUrl, importMethod = "overwrite")
{
    if (importMethod == "clear")
    {
        actionMapsMasterList.forEach(a => a.resetAllBinds());
    }
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
                    if (importMethod == "preserve" && mappedActionObj.getBind(InputModeSelection.KEYBOARD)) return;
                    mappedActionObj.setBind(InputModeSelection.KEYBOARD, importKeyboardBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.KEYBOARD, importKeyboardBind[0])
                    mappedActionObj.setActivationMode(importKeyboardBind[2], InputModeSelection.KEYBOARD);
                }
                if (importControllerBind && !importControllerBind.every(v => v === null))
                {
                    if (importMethod == "preserve" && mappedActionObj.getBind(InputModeSelection.CONTROLLER)) return;
                    mappedActionObj.setBind(InputModeSelection.CONTROLLER, importControllerBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.CONTROLLER, importControllerBind[0])
                    mappedActionObj.setActivationMode(importControllerBind[2], InputModeSelection.CONTROLLER);
                }
                if (importJoystickBind && !importJoystickBind.every(v => v === null))
                {
                    if (importMethod == "preserve" && mappedActionObj.getBind(InputModeSelection.JOYSTICK)) return;
                    mappedActionObj.setBind(InputModeSelection.JOYSTICK, importJoystickBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.JOYSTICK, importJoystickBind[0])
                    mappedActionObj.setActivationMode(importJoystickBind[2], InputModeSelection.JOYSTICK);
                }
                if (importMouseBind && !importMouseBind.every(v => v === null))
                {
                    if (importMethod == "preserve" && mappedActionObj.getBind(InputModeSelection.MOUSE)) return;
                    mappedActionObj.setBind(InputModeSelection.MOUSE, importMouseBind[1]);
                    mappedActionObj.setBindDevice(InputModeSelection.MOUSE, importMouseBind[0])
                    mappedActionObj.setActivationMode(importMouseBind[2], InputModeSelection.MOUSE);
                }
            }
            else
            {
                console.log("Keybind not found: " + importActionName);
            }

        });
    });
    saveUserChanges();
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
        localName: getLocalisedLabel(a),
        parsedLabel: getActionLabel(a.getActionName()),
        // description: a.getDescription(),
        keywords: a.getKeywords().join(' ')
    }));

    fuse = new Fuse(list, {
        keys: [
            { name: 'actionName', weight: 0.6 },
            { name: 'localName', weight: 0.7 },
            { name: 'parsedLabel', weight: 0.3 },
            // { name: 'description', weight: 0.2 },
            { name: 'keywords', weight: 0.3 }
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

    // --- Input  filtering ---
    if (inputFilter && inputFilter.input != "")
    {
        //helper function
        function matchesInput(b, d, inputFilter)
        {
            if (!b) return false;
            const modifierAliases = {
                "alt": ["lalt", "ralt"],
                "control": ["lctrl", "rctrl"],
                "shift": ["lshift", "rshift"]
            };
            if (InputState.current === InputModeSelection.JOYSTICK && !modifierAliases[inputFilter.input] && d != inputFilter.device) return false;
            const controllerStickAliases = {
                "thumbl": ["thumbl_up", "thumbl_down", "thumbl_right", "thumbl_left", "thumbl"],
                "thumbr": ["thumbr_up", "thumbr_down", "thumbr_right", "thumbr_left", "thumbr"],
            };
            const filter = inputFilter?.input?.trim();

            // Expand filter to all acceptable matches
            const validInputs = modifierAliases[filter] || controllerStickAliases[filter] || [filter];

            // if b contains multiple inputs, split it
            const parts = b.includes("+") ? b.split("+") : [b];
            return parts.some(p => validInputs.includes(p.trim()));
        }

        filtered = filtered.filter(item =>
        {
            const b = item.getBind() ? item.getBind() : item.getDefaultBind();
            const d = item.getBindDevice();
            return typeof b === "string" && b.trim().length > 0 && matchesInput(b, d, inputFilter);
        });
    }

    else
    {
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

            console.log("Forced fuse off, because it isn't searching as well as it should for some reason");
            if (fuse && !fuse)
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
                    // const desc = item.getDescription().toLowerCase();
                    const keywords = item.getKeywords().map(k => k.toLowerCase());

                    const localizedName = getLocalisedLabel(item).toLowerCase();

                    return name.includes(searchQuery) ||
                        localizedName.includes(searchQuery) ||
                        // desc.includes(searchQuery) ||
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
    if (state) { clearAllFilters() }
    updatefilteredNames();
}

function clearAllFilters()
{
    keybindSearch.value = null;
    inputFilter.input = "";
    showBoundActionsState = 0;
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
        tagDiv.classList.toggle('active', false);
    });

    selectedTags = [];
    hideSubcategoryTags();
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
        valueDiv.innerHTML !== '' && (valueDiv.innerHTML = '');
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
            valueDiv.innerHTML !== '' && (valueDiv.innerHTML = '');
            valueDiv.appendChild(renderKeybindKeys(actionObj.getBind(), actionObj.getBind() === actionObj.getDefaultBind()));
            valueDiv.classList.remove('awaiting');
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
    //i think this can just... go?
    // input.disabled = false;

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
    rowContainer.innerHTML !== '' && (rowContainer.innerHTML = '');
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
    const parsedName = getLocalisedLabel(b);

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
    typeDiv.textContent !== parsedName && (typeDiv.textContent = parsedName);


    const valueDiv = document.createElement('div');
    valueDiv.classList.add('keybind__value');


    const activationModeIconDiv = document.createElement('div');
    activationModeIconDiv.classList.add('button-activationMode');

    const wrapper = document.createElement('div');
    wrapper.classList.add('button-wrapper');

    const icon = document.createElement('span');
    wrapper.appendChild(icon);
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
        const rowActionName = bindRow?.dataset.actionName
        const bind = actionMapsMasterList?.find(a => a?.getActionName() === rowActionName);
        const currentBind = bind.getBind();
        const defaultBind = bind.getDefaultBind();
        const bindDevice = bind.getBindDevice();
        const bindValue = currentBind !== "" ? currentBind : defaultBind;

        if (bindValueDiv)
        {
            bindValueDiv.innerHTML !== '' && (bindValueDiv.innerHTML = '');
            if (bindValue)
            {
                const isDefaultBind = (bindValue === defaultBind && bind.getActivationMode() === bind.getDefaultActivationMode());
                bindValueDiv.appendChild(renderKeybindKeys(bindValue ? `Device ${ bindDevice }: ${ bindValue }` : ``, isDefaultBind));
                if (bindValueDiv.classList.contains('awaiting')) bindValueDiv.classList.remove('awaiting');
            }
        }

        if (consoleInputField)
        {
            consoleInputField.value = "";
            if (bindValue)
            {
                consoleInputField.placeholder = bindValue ? bindDevice + ":" + bindValue : "";
            }
            else
            {
                if (consoleInputField.placeholder != "") consoleInputField.placeholder = ""
            }
        }

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



//#region Tag Generation
function generateMainCategoryTags()
{
    tagContainer.innerHTML !== '' && (tagContainer.innerHTML = '');

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
function renderKeybindKeys(keybindString, isDefaultBind)
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
        shoulderl: "Left Shoulder Button",
        shoulderr: "Right Shoulder Button",
        triggerl_btn: "Left Trigger",
        triggerr_btn: "Right Trigger",
        thumbl: "Left Thumb Stick (Button)",
        thumbr: "Right Thumb Stick (Button)",
        dpad_up: "Up (D-pad)",
        dpad_down: "Down (D-pad)",
        dpad_left: "Left (D-pad)",
        dpad_right: "Right (D-pad)",
        thumbl_up: "Up (Left Thumb Stick)",
        thumbl_down: "Down (Left Thumb Stick)",
        thumbl_left: "Left (Left Thumb Stick)",
        thumbl_right: "Right (Left Thumb Stick)",
        thumbr_up: "Up (Right Thumb Stick)",
        thumbr_down: "Down (Right Thumb Stick)",
        thumbr_left: "Left (Right Thumb Stick)",
        thumbr_right: "Right (Right Thumb Stick)",
        thumblx: "X-Axis (Left Thumb Stick)",
        thumbly: "Y-Axis (Left Thumb Stick)",
        thumbrx: "X-Axis (Right Thumb Stick)",
        thumbry: "Y-Axis (Right Thumb Stick)",
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
            if (isDefaultBind)
            {
                keyDiv.classList.add('default', isDefaultBind);
            }

            display = display[0].toUpperCase() + display.slice(1);
            const side = display.endsWith('Left') ? leftIndicator :
                display.endsWith('Right') ? rightIndicator : '';
            display = display.replace(/ControlLeft|ControlRight/, 'CTRL');
            display = display.replace(/ShiftLeft|ShiftRight/, 'Shift');
            display = display.replace(/AltLeft|AltRight/, 'Alt');
            keyDiv.textContent = display.trim();

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
            // keyDiv.classList.add('key', 'key--unbound');
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
    if (!b.getDescription() || b?.getDescription().startsWith("@")) b.setDescription();

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
        keybindDescriptionTags.innerHTML !== '' && (keybindDescriptionTags.innerHTML = '');

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
    const bindDevice = bindActionMap.getBindDevice()

    if (!thisBindKey) return false;

    const hasConflict = actionMapsMasterList.some(item =>
    {
        const key = item.getBind()?.trim();
        if (!key) return false;
        return key === thisBindKey && item.getActionName() !== thisBindName && bindDevice === item.getBindDevice();
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
    keybindDescriptionTags.innerHTML !== '' && (keybindDescriptionTags.innerHTML = '');
    keybindDescriptionText.textContent !== '' && (keybindDescriptionText.textContent = '');
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
        ShowKeybindDescription();
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

    const isBody = e.target === document.body;
    const inContent = e.target.closest(".content");
    const inFooter = e.target.closest(".footer__keybind-info");
    const inWrapper = e.target.closest(".content-keybinds-absolute-wrapper");

    if ((isBody || (inContent && !inWrapper)) && !inFooter)
    {
        if (e &&
            e.target.closest(".inputType-select") ||
            e.target.closest(".searchbar-container ")
        ) return;

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
}
function onClickAnywhereClosePresets(e)
{
    const inPopoutNavBar = e.target.closest(".popout-navbar.open");
    const inPresetsButton = e.target.closest(".presetsButton");

    if (!inPopoutNavBar && !inPresetsButton)
    {
        closePresetsPopout();
    }
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
                if (!joystickActive)
                {
                    joystickActive = true;
                    joystickPollHandle = requestAnimationFrame(pollJoysticks);
                }
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
//#region NavBar Buttons

function onClickNavBar(e)
{
    if (e)
    {
        if (e.target.closest('.presetsButton'))
        {
            e.stopPropagation();
            onClickPresetsButton(e);
        }
        else if (e.target.closest('.mode-toggle')) onClickBindModeToggle();
    }
}

function onClickPresetsButton(e)
{
    e?.stopPropagation(e);
    if (popout.classList.contains('open'))
    {
        closePresetsPopout()
    } else
    {
        openPresetsPopout()
    }

}


function openPresetsPopout()
{
    if (!popout || !popoutInner) return;

    // Ensure content is visible
    popoutInner.classList.remove('hidden');
    btnPresets.classList.add('selected')

    // Reset height for animation
    popout.style.height = "0px";
    popout.style.padding = "1rem 0.5rem";
    popout.classList.add('open');

    // Animate height to content
    requestAnimationFrame(() =>
    {
        const totalHeight = popout.scrollHeight;
        popout.style.height = totalHeight + "px";
    });
}

function closePresetsPopout()
{
    if (!popout || !popoutInner) return;

    // Fade out buttons first
    popoutInner.classList.add('hidden');



    setTimeout(() =>
    {
        // Collapse popout
        popout.style.height = "0px";
        popout.classList.remove('open');

        // Reset padding if needed
        popout.style.padding = "0 0.5rem";
    }, 150); // matches fade duration
}



// Cleanup after popout collapse finishes
popout?.addEventListener('transitionend', (e) =>
{
    if (e.propertyName === "height")
    { // watch height, not transform
        if (popout.style.height === "0px")
        {
            btnPresets.classList.remove('selected')

            popout.classList.remove("open");
            popoutInner?.classList.remove("fade-out");
        }
    }
});

function renderPresetButtons()
{
    Object.entries(presetData).forEach(([sectionName, presets]) =>
    {
        const sectionEl = presetSections.querySelector(`[data-section="${ sectionName }"]`);
        if (!sectionEl) return;

        presets.forEach(preset =>
        {
            const btn = document.createElement('button');
            btn.className = "button preset-btn";
            btn.textContent = preset.text;
            btn.dataset.desc = preset.desc;
            btn.dataset.file = preset.file; // stored for later use

            sectionEl.appendChild(btn);
        });
    });
}



function onHoverPresets(e)
{
    const btn = e.target.closest('.preset-btn');
    if (!btn) return; // ignore if not a button
    const desc = btn.dataset.desc || '';
    presetDescription.textContent = desc;
}
function onLeaveHoverPresets(e)
{
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    presetDescription.textContent = 'Hover over a button to see its description';
}

// async function onClickLoadPreset(e)
// {
//     const btn = e.target.closest('.preset-btn');
//     if (!btn) return; // clicked outside a button

//     const filePath = btn.dataset.file;
//     await importCustomKeybindsXML(filePath)
//     showAllBinds();
//     closePresetsPopout();
// }


let presetLoading = false;

async function onClickLoadPreset(e)
{
    if (presetLoading) return; // prevent double triggering
    presetLoading = true;

    const btn = e.target.closest('.preset-btn');
    if (!btn)
    {
        presetLoading = false;
        return;
    }

    const filePath = btn.dataset.file;
    const titleText = btn.textContent;

    const result = await showConfirmModal(titleText);
    closePresetsPopout();

    if (result === "overwrite")
        await importCustomKeybindsXML(filePath);

    else if (result === "preserve")
        await importCustomKeybindsXML(filePath, "preserve");

    else if (result === "clear")
        await importCustomKeybindsXML(filePath, "clear");

    // cancelled → do nothing

    showAllBinds();
    presetLoading = false;
}

//this is modular but ill probably forget and make a dozen more
function showConfirmModal(titleText)
{
    return new Promise(resolve =>
    {

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-box">
                <h3>${ titleText }</h3>
                <p>How do you wish to apply this preset?</p>

                <div class="confirm-buttons">
                    <button class="btn-option" data-mode="overwrite">
                        Overwrite existing binds
                    </button>

                    <button class="btn-option" data-mode="preserve">
                        Preserve existing binds
                    </button>

                    <button class="btn-option" data-mode="clear">
                        Clear ALL binds before applying
                    </button>

                    <button class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle the option buttons
        modal.querySelectorAll('.btn-option').forEach(btn =>
        {
            btn.addEventListener('click', () =>
            {
                const mode = btn.dataset.mode;
                modal.remove();
                resolve(mode);   // return "overwrite" / "preserve" / "clear"
            });
        });

        modal.querySelector('.btn-cancel').addEventListener('click', () =>
        {
            modal.remove();
            resolve(false);
        });
    });
}



//#endregion

function onClickToggleAttributions(e)
{
    if (e && e.target.closest('.attribution-text')) return
    const isClosed = attributionsSection.classList.contains("closed");
    attributionsSection.classList.toggle("closed");

    if (isClosed)
    {
        // Get the distance from top of the document to the bottom of the div
        const rect = attributionsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const margin = 30;

        const targetScroll = scrollTop + rect.bottom + margin - window.innerHeight;

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

function onClickSelectActivationMode(e)
{
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
        <div data-mode="${ activationModeType.NONE }">None</div>

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
                updateBindRow();
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

const cachedActivationModeIcons = {}
const activationModeDescriptions = {
    [activationModeType.PRESS]: ": Press the key/button",
    [activationModeType.PRESS_QUICKER]: ": Press or tap",
    [activationModeType.PRESS_SHORT]: ": Like 'Press' but only if held >0.15s",
    [activationModeType.PRESS_MEDIUM]: ": Like 'Press' but only if held >0.25s",
    [activationModeType.PRESS_EXTRA_MEDIUM]: ": Like 'Press' but only if held >0.5s",
    [activationModeType.PRESS_LONG]: ": Like 'Press' but only if held >1.5s",
    [activationModeType.TAP]: ": Press & release quickly",
    [activationModeType.TAP_QUICKER]: ": Press & release very quickly",
    [activationModeType.DOUBLETAP_BLOCKING]: ": Tap twice, blocks initial tap if double tap is registered.",
    [activationModeType.DOUBLETAP_NONBLOCKING]: ": Tap twice, allows initial tap.",
    [activationModeType.HELD]: ": Hold to continue activating.",
    [activationModeType.HOLD_SHORT]: ": Like Hold, but with a 0.25s delay.",
    [activationModeType.HOLD_LONG]: ": Like Hold, but with a 1.5s delay.",
    [activationModeType.HOLD_NO_RETRIGGER]: ": IDK?",
    [activationModeType.HOLD_LONG_NO_RETRIGGER]: ": IDK?",
    [activationModeType.ALL]: ": Any/all activation modes combined.",
    [activationModeType.HOLD_TOGGLE]: ": Hold/Release to activate/deactivate.",
    [activationModeType.SMART_TOGGLE]: ": Tap to toggle, hold/release to activate/deactivate.",
};


function setActivationModeButtonIcon(buttonObject, bindObject)
{
    const objectActivationMode = bindObject.getActivationMode();
    const activationMode = objectActivationMode || bindObject.getDefaultActivationMode();
    const modeKey = activationMode || "none";

    // EARLY EXIT: already set
    if (buttonObject.dataset.mode === modeKey)
    {
        return;
    }

    // Update tracking
    buttonObject.dataset.mode = modeKey;

    // Clear existing icon if any
    buttonObject.innerHTML = '';

    // Ensure icon exists in cache
    if (!cachedActivationModeIcons[modeKey])
    {
        const img = document.createElement('img');
        img.classList.add('activation-icon');
        img.src = `./assets/tapIcons/icon_${ modeKey }.svg`;
        cachedActivationModeIcons[modeKey] = img;
    }

    // Clone cached icon
    const iconClone = cachedActivationModeIcons[modeKey].cloneNode();

    // Tooltip text
    const tt_text = activationModeDescriptions[activationMode] || "";
    const activationModeParsed = activationMode
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    buttonObject.title = `${ activationModeParsed }${ tt_text }`;

    // Add icon to button
    buttonObject.appendChild(iconClone);
}
// function setActivationModeButtonIcon(buttonObject, bindObject)
// {
//     buttonObject.innerHTML !== '' && (buttonObject.innerHTML = '');


//     const objectActivationMode = bindObject.getActivationMode();
//     const activationMode = objectActivationMode ? objectActivationMode : bindObject.getDefaultActivationMode();



//     const iconFileName = activationMode ? activationMode : `none`;
//     const iconPath = `./assets/tapIcons/icon_${ iconFileName }.svg`;

//     // Check cache
//     if (!cachedActivationModeIcons[iconFileName])
//     {
//         const img = document.createElement('img');
//         img.classList.add('activation-icon');
//         img.src = iconPath;

//         // store original image
//         cachedActivationModeIcons[iconFileName] = img;
//     }
//     // Clone the cached image so you don't move it around in DOM
//     const iconClone = cachedActivationModeIcons[iconFileName].cloneNode();
//     //the below line was pre cached version
//     // icon.src = iconFileName ? `./assets/tapIcons/icon_${ iconFileName }.svg` : `./assets/tapIcons/icon_all.svg`

//     const tt_text = activationModeDescriptions[activationMode] || "";

//     const activationModeParsed = activationMode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

//     buttonObject.title = `${ activationModeParsed }${ tt_text }`;

//     // Add to the div
//     // buttonObject.appendChild(icon);
//     buttonObject.appendChild(iconClone);
// }

function onHoldClearKeybind(e)
{
    //make it so hold to clear ignores console input, activation mode button
    const targetRow = e.target.closest(".keybind__row");
    if (e &&
        (e.target.closest(".keybind__consoleInput") ||
            e.target.closest(".activation-icon")
        )) return;
    if (targetRow === currentlySelectedKeybindElement)
    {
        holdTimer = setTimeout(() =>
        {
            onClickClearKeybind();
        }, 500);
    }
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
        bind.clearBind(InputState.current, true);

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
        Vehicle: ["Engineering", "Salvage", "Mining", "Turrets", "Defences", "Weapons", "Power", "Systems", "MFDs", "Movement", "Targeting", "Vehicle - Other"],
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

function onClickFooterButtons(event)
{
    const btn = event.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("button--clear")) onClickClearAllKeybinds();
    else if (btn.classList.contains("button--export")) onClickExportKeybinds();
    else if (btn.classList.contains("button--import")) onClickImportKeybinds();
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

function onClickBindModeToggle(assignedMode)
{
    if (bindMode !== assignedMode)
    {
        const mode = assignedMode || (modeToggle.dataset.mode === "binder" ? "finder" : "binder");
        modeToggle.dataset.mode = mode;
        modeToggle.classList.toggle('finder', mode === 'finder');
        SetBindMode(mode);
    }
}

async function onClickClearAllKeybinds()
{
    const ok = await confirmClearAllKeybinds(`Are you sure you want to clear all ${ InputState.current } binds?`);
    if (!ok) return;

    actionMapsMasterList.forEach(a => a.resetBind(InputState.current, false));
    updatefilteredNames();
    saveUserChanges();
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
let modifierHeld = false;     // is button 4 held right now?
let modifierStartTime = 0;    // track when 4 was pressed (optional safety timeout)
let modifierTriggered = false;// true if a combo was recorded while 4 was held

function pollGamepads()
{
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gamepads)
    {
        if (!gp) continue;

        const DEADZONE = 0.3;
        let stickDirection = null;

        // Check modifier state
        const button4 = gp.buttons[4];
        if (button4?.pressed)
        {
            // just pressed
            if (!modifierHeld)
            {
                modifierHeld = true;
                modifierTriggered = false;
                modifierStartTime = performance.now();
            }
        } else if (modifierHeld && !button4.pressed)
        {
            // released
            if (!modifierTriggered)
            {
                // record plain "4" if released without other input
                gamepadPollId = "4";
            }
            modifierHeld = false;
        }

        // Left stick
        const lx = gp.axes[0];
        const ly = gp.axes[1];
        // Right stick
        const rx = gp.axes[2];
        const ry = gp.axes[3];

        // Detect stick movement
        if (Math.abs(lx) > DEADZONE || Math.abs(ly) > DEADZONE)
        {
            stickDirection = Math.abs(lx) > Math.abs(ly)
                ? (lx > 0 ? "thumbl_right" : "thumbl_left")
                : (ly > 0 ? "thumbl_down" : "thumbl_up");
            gamepadPollId = stickDirection;
        }
        else if (Math.abs(rx) > DEADZONE || Math.abs(ry) > DEADZONE)
        {
            stickDirection = Math.abs(rx) > Math.abs(ry)
                ? (rx > 0 ? "thumbr_right" : "thumbr_left")
                : (ry > 0 ? "thumbr_down" : "thumbr_up");
            gamepadPollId = stickDirection;
        }

        // Check buttons
        gp.buttons.forEach((button, index) =>
        {
            if (button.pressed && index !== 4)
            {
                gamepadPollId = `${ index }`;
            }
        });

        // --- Handle modifier combos ---
        if (modifierHeld && gamepadPollId && gamepadPollId !== "4")
        {
            gamepadPollId = `${ parseGamepadInputToStarCitizenBind(4) }+${ parseGamepadInputToStarCitizenBind(gamepadPollId) }`;
            modifierTriggered = true;
            modifierHeld = false; // optional: consume modifier after combo
        }

        // --- Finalize ---
        if (gamepadPollId)
        {
            const inputArr = parseGamepadInputToStarCitizenBind(gamepadPollId);
            finalizeCapture_Controller(inputArr, 1);
            return;
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
            "6": "triggerl_btn",
            "7": "triggerr_btn",
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
let joystickPollHandle = null; // <-- this tracks the animation frame
let joystickActive = false;    // optional safety flag

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

const joystickProfile = {
    "x": 0,
    "y": 1,
    "z": 2,
    "Rx": 3,
    "Ry": 4,
    "Rz": 5,
    "slider": 6,
    "hat": 9
}


let cachedProfiles = null;

async function GetAllJoystickProfiles()
{
    if (!cachedProfiles)
    {
        const res = await fetch("./mappingProfile.json");
        cachedProfiles = await res.json();
    }
    return cachedProfiles;
}

//now deprecated 
async function GetJoystickProfile(name = "Thrustmaster T16000M")
{
    try
    {
        // Fetch the JSON file
        const response = await fetch("./mappingProfile.json");
        const data = await response.json();

        // Return the profile you want (default: Thrustmaster)
        return data[name];
    } catch (err)
    {
        console.error("Failed to load joystick profile:", err);
        return null;
    }
}

async function GetJoystickModelsFromJSON()
{
    const data = await GetAllJoystickProfiles();
    return Object.keys(data); // e.g. ["Thrustmaster T16000M", "Other"]
}

const joystickButton = document.querySelector(".joystick-dropdown-button");
const joystickDropdown = document.querySelector(".joystick-dropdown-menu");
async function setupJoystickDropdown()
{

    // Create or select the span inside the button for text
    let buttonText = joystickButton?.querySelector(".button-text");
    if (!buttonText && joystickButton)
    {
        buttonText = document.createElement("span");
        buttonText.className = "button-text";
        // Move current text into span
        buttonText.textContent = joystickButton.textContent.replace(" ▾", "");
        joystickButton.textContent = ""; // clear button
        joystickButton.appendChild(buttonText);
        // Append arrow
        joystickButton.insertAdjacentHTML("beforeend", " ▾");
    }

    // Fetch joystick models
    const models = await GetJoystickModelsFromJSON();

    // Clear old items
    if (joystickButton) joystickDropdown.innerHTML = "";

    models.forEach(model =>
    {
        const item = document.createElement("div");
        item.className = "joystick-dropdown-item";
        item.textContent = model;

        item.addEventListener("click", async () =>
        {
            joystickProfile = await GetJoystickProfile(model);
            console.log("Loaded joystick profile:", joystickProfile);

            // Hide dropdown
            joystickDropdown.style.display = "none";

            // Update only the span text
            buttonText.textContent = model;
        });

        if (joystickDropdown) joystickDropdown.appendChild(item);
    });

    // Toggle dropdown visibility
    if (joystickButton) joystickButton.addEventListener("click", () =>
    {
        joystickDropdown.style.display =
            joystickDropdown.style.display === "block" ? "none" : "block";
    });
}




const JOYSTICKDEADZONE = 0.06; // general small threshold to ignore noise
function pollJoysticks()
{
    const joysticks = navigator.getGamepads ? navigator.getGamepads() : [];

    for (let js of joysticks)
    {
        if (!js) continue;

        let joystickPollId = null;

        const physicalIndex = js.index;
        const deviceNumber = connectedDevices[physicalIndex] ?? physicalIndex + 1

        // Helper to assign input consistently
        const setInput = (input) => ({
            device: deviceNumber,
            input
        });

        // --- Initialize previous state and slider baseline ---
        if (!window._prevGamepadStates[js.index])
        {
            window._prevGamepadStates[js.index] = {
                axes: [...js.axes],
                buttons: js.buttons.map(b => b.pressed)
            };
        }

        if (!window._sliderBaseline[js.index])
            window._sliderBaseline[js.index] = js.axes[6]; // slider resting value

        const prev = window._prevGamepadStates[js.index];

        // --- Axes: sticks, twist, hat, sliders ---
        js.axes.forEach((value, i) =>
        {
            const prevVal = prev.axes[i] || 0;
            if (Math.abs(value - prevVal) > JOYSTICKDEADZONE)
            {
                console.log(`Device ${ js.index }: Axis ${ i } = ${ value.toFixed(2) }`);
                const axesIndex = joystickProfile == "debug" ? -1 : i;

                switch (axesIndex)
                {
                    case joystickProfile.x:
                        joystickPollId = setInput(HandleJoystickAxis_X(value));
                        break;
                    case joystickProfile.y:
                        joystickPollId = setInput(HandleJoystickAxis_Y(value));
                        break;
                    case joystickProfile.z:
                        joystickPollId = setInput(HandleJoystickAxis_Z(value));
                        break;
                    case joystickProfile.Rx:
                        joystickPollId = setInput(HandleJoystickAxis_Rx(value));
                        break;
                    case joystickProfile.Ry:
                        joystickPollId = setInput(HandleJoystickAxis_Ry(value));
                        break;
                    case joystickProfile.Rz:
                        joystickPollId = setInput(HandleJoystickAxis_Rz(value));
                        break;
                    case joystickProfile.hat:
                        joystickPollId = setInput(HandleJoystickAxis_Hat(value, deviceNumber));
                        break;
                    case joystickProfile.slider:
                        joystickPollId = setInput(HandleJoystickAxis_Slider(value, deviceNumber));
                        break;
                    case joystickProfile.wheel:
                        joystickPollId = setInput(HandleJoystickAxis_Wheel(value, deviceNumber));
                        break;
                    default:
                        const ax = js.axes[i];
                        if (Math.abs(ax) > JOYSTICKDEADZONE)
                        {
                            const stickDirection = ax > 0 ? "positive" : "negative";
                            joystickPollId = setInput(`Input Axis Number: ${ i } | Direction of Axes: ${ stickDirection }`);
                        }
                        break;
                }
            }
        });

        // --- Buttons: capture on release instead of press ---
        js.buttons.forEach((button, i) =>
        {
            const prevPressed = prev.buttons[i] || false;
            const nowPressed = button.pressed;

            // Log button state change
            if (nowPressed !== prevPressed)
                console.log(`Device ${ js.index }: Button ${ i } ${ nowPressed ? "pressed" : "released" }`);

            // ✅ Capture only when button is released
            if (!nowPressed && prevPressed)
            {
                const joybtn = parseInt(i, 10) + 1;
                joystickPollId = setInput(`${ joybtn }`);
            }
        });

        // --- Update previous state for next frame ---
        window._prevGamepadStates[js.index].axes = [...js.axes];
        window._prevGamepadStates[js.index].buttons = js.buttons.map(b => b.pressed);

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

    // Continue polling
    if (joystickActive)
        joystickPollHandle = requestAnimationFrame(pollJoysticks);
}


//controler axis parsing
function HandleLeftThumbStick_X(value)
{
    return "thumbl";
}
function HandleLeftThumbStick_Y(value)
{
    return "thumbl";
}
function HandleRightThumbStick_X(value)
{
    return "thumbr";
}
function HandleRightThumbStick_Y(value)
{
    return "thumbr";
}
//joystick axis parsing
function HandleJoystickAxis_X(value)
{
    return "x"
}
function HandleJoystickAxis_Y(value)
{
    return "y"
}
function HandleJoystickAxis_Z(value)
{
    return "z"
}
function HandleJoystickAxis_Rx(value)
{
    return "rotx"
}
function HandleJoystickAxis_Ry(value)
{
    return "roty"
}
function HandleJoystickAxis_Rz(value)
{
    return "rotz"
}
function HandleJoystickAxis_Hat(value, deviceIndex = 1)
{
    let direction = null;
    if (value < -0.5) direction = "up";
    else if (value > 0.5) direction = "left";  // example, adjust based on your logs
    else if (value > 0) direction = "down";
    else if (value < 0) direction = "right";

    if (direction)
    {
        return "hat" + 1 + "_" + direction;
    }
}
function HandleJoystickAxis_Slider(value, deviceIndex = 1)
{
    const baseline = window._sliderBaseline[deviceIndex - 1];
    if (Math.abs(value - baseline) > JOYSTICKDEADZONE)
    {
        const direction = value > baseline ? "down" : "up";
        //direction of slide doesn't seem to be needed for recording the bind, but keeping the val here in case I want it
        return "slider" + deviceIndex;
    }
}
function HandleJoystickAxis_Wheel(value, deviceIndex = 1)
{
    console.log("unfinished");
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

    modifiers.ctrl.left = false;
    modifiers.ctrl.right = false;
    modifiers.shift.left = false;
    modifiers.shift.right = false;
    modifiers.alt.left = false;
    modifiers.alt.right = false;
}



// Later, to stop polling:
function stopPollingJoysticks()
{
    joystickActive = false;
    if (joystickPollHandle)
    {
        cancelAnimationFrame(joystickPollHandle);
        joystickPollHandle = null;
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

function onUserChangedBind(actionObject)
{
    const newInput = actionObject.getBind()
    const newDeviceIndex = actionObject.getBindDevice();
    const newActivationMode = actionObject.getActivationMode();
    const b = actionObject.bind[InputState.current];
    b.input !== newInput && (b.input = newInput);
    b.deviceIndex !== newDeviceIndex && (b.deviceIndex = newDeviceIndex);
    b.activationMode !== newActivationMode && (b.activationMode = newActivationMode);

    saveUserChanges();
}


async function keybindsJSON()
{
    try
    {
        const response = await fetch('./keybinds.json');
        if (!response.ok) throw new Error('Failed to load JSON');
        actionMapDictionary = await response.json();

        actionMapsMasterList.length = 0; // clear safely
        mappedActionSource.forEach(entry => actionMapsMasterList.push(new MappedAction(entry)))

    } catch (err)
    {
        console.error("Error loading action map dictionary:", err);
    }
}
async function initActionMaps()
{
    // const actions = await loadAndParseDataminedXML();
    const actions = actionMapsMasterList;
    const savedJson = localStorage.getItem("userMappedActions");

    if (savedJson)
    {
        const savedActions = JSON.parse(savedJson);
        savedActions.forEach(saved =>
        {
            const action = actions.find(a => a.actionName === saved.actionName);
            if (action)
            {
                deserializeMappedAction(saved, action);
            }
        });
    }

    return actions;
}

//#region Binder or Finder

function SetBindMode(mode = "binder", btn)
{
    bindMode = mode;
    navBar.querySelectorAll('button[data-action]').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
    if (bindMode === "finder")
    {
        switch (InputState.current)
        {
            case InputModeSelection.CONTROLLER:
                findFromInput_Controller();
                break;
            case InputModeSelection.JOYSTICK:
                findFromInput_Joystick();
                break;
            case InputModeSelection.KEYBOARD:
            default:
                findFromInput_MouseKeyboard();
                break;
        }
    }
    else if (bindMode === "binder")
    {
        if (inputFilter)
        {
            Object.assign(inputFilter, { input: "", device: "" });
        }

    }
}

let inputFilter = {
    input: "",
    device: ""
};

const previousButtonStates = {};
const baselineAxes_finder = {}; // initial baseline
const prevAxesValues = {};      // per-frame previous value
let lastInputTime = 0;
const DEBOUNCE_MS = 100;

function findFromInput_Joystick()
{
    enableKeyboardFinder();

    function listen()
    {
        if (document.activeElement === keybindSearch)
        {
            requestAnimationFrame(listen);
            return;
        }
        const now = performance.now();
        const pads = navigator.getGamepads();

        for (let pad of pads)
        {
            if (!pad) continue;
            const logicalDevice = connectedDevices[pad.index];

            if (!previousButtonStates[pad.index])
            {
                previousButtonStates[pad.index] = pad.buttons.map(b => b.pressed);
            }

            if (!baselineAxes_finder[pad.index])
            {
                baselineAxes_finder[pad.index] = [...pad.axes];
            }

            if (!prevAxesValues[pad.index])
            {
                prevAxesValues[pad.index] = [...pad.axes];
            }

            // --- Buttons ---
            for (let i = 0; i < pad.buttons.length; i++)
            {
                const b = pad.buttons[i];
                const wasPressed = previousButtonStates[pad.index][i];

                if (wasPressed && !b.pressed && (now - lastInputTime > DEBOUNCE_MS))
                {
                    inputFilter.input = `button${ i + 1 }`;
                    inputFilter.device = logicalDevice;
                    console.log(logicalDevice);
                    lastInputTime = now;
                    updatefilteredNames();
                }

                previousButtonStates[pad.index][i] = b.pressed;
            }

            // --- Axes ---
            for (let i = 0; i < pad.axes.length; i++)
            {
                const value = pad.axes[i];
                const isDynamic = (i === 2 || i === 6); // slider/trigger axes
                const delta = Math.abs(value - (isDynamic ? prevAxesValues[pad.index][i] : baselineAxes_finder[pad.index][i]));
                if (((isDynamic && delta > 0.001) || (!isDynamic && delta > 0.15)) && (now - lastInputTime > DEBOUNCE_MS)) 
                {
                    inputFilter.device = logicalDevice;

                    switch (i)
                    {
                        case joystickProfile.x: inputFilter.input = HandleJoystickAxis_X(value); break;
                        case joystickProfile.y: inputFilter.input = HandleJoystickAxis_Y(value); break;
                        case joystickProfile.z: inputFilter.input = HandleJoystickAxis_Z(value); break;
                        case joystickProfile.Rx: inputFilter.input = HandleJoystickAxis_Rx(value); break;
                        case joystickProfile.Ry: inputFilter.input = HandleJoystickAxis_Ry(value); break;
                        case joystickProfile.Rz: inputFilter.input = HandleJoystickAxis_Rz(value); break;
                        case joystickProfile.hat: inputFilter.input = HandleJoystickAxis_Hat(value, logicalDevice); break;
                        case joystickProfile.slider: inputFilter.input = HandleJoystickAxis_Slider(value, logicalDevice); break;
                    }

                    lastInputTime = now;
                    updatefilteredNames();
                }

                // Update previous axes value for next frame
                prevAxesValues[pad.index][i] = value;
            }
        }

        if (bindMode === "finder") requestAnimationFrame(listen);
        else
        {
            disableKeyboardFinder();
            Object.assign(inputFilter, { input: "", device: "" });
        }
    }

    listen();
}


function enableKeyboardFinder()
{
    window.addEventListener("keydown", keyboardFinderHandler);
}

function disableKeyboardFinder()
{
    window.removeEventListener("keydown", keyboardFinderHandler);
}

function keyboardFinderHandler(e)
{
    if (document.activeElement === keybindSearch)
    {
        requestAnimationFrame(listen);
        return;
    }
    e.preventDefault();
    if (e.repeat) return; // ignore held-down repeats

    if (e.key === "Control" || e.key === "Shift" || e.key === "Alt")
    {
        // If you want it included in inputFilter:
        inputFilter.input = e.key.toLowerCase(); // "control" / "shift" / "alt"
        inputFilter.device = "keyboard";

        updatefilteredNames();
    }
}




function findFromInput_Controller()
{
    function listen()
    {
        if (document.activeElement === keybindSearch)
        {
            requestAnimationFrame(listen);
            return;
        }
        const now = performance.now();
        const pads = navigator.getGamepads();

        for (let pad of pads)
        {
            if (!pad) continue;
            const logicalDevice = connectedDevices[pad.index];

            if (!previousButtonStates[pad.index])
            {
                previousButtonStates[pad.index] = pad.buttons.map(b => b.pressed);
            }

            if (!baselineAxes_finder[pad.index])
            {
                baselineAxes_finder[pad.index] = [...pad.axes];
            }

            if (!prevAxesValues[pad.index])
            {
                prevAxesValues[pad.index] = [...pad.axes];
            }

            // --- Buttons ---
            for (let i = 0; i < pad.buttons.length; i++)
            {
                const b = pad.buttons[i];
                const wasPressed = previousButtonStates[pad.index][i];

                if (wasPressed && !b.pressed && (now - lastInputTime > DEBOUNCE_MS))
                {
                    inputFilter.input = parseGamepadInputToStarCitizenBind(`${ i }`);
                    inputFilter.device = logicalDevice;
                    lastInputTime = now;
                    updatefilteredNames();
                }

                previousButtonStates[pad.index][i] = b.pressed;
            }

            // --- Axes ---
            for (let i = 0; i < pad.axes.length; i++)
            {
                const value = pad.axes[i];
                const delta = Math.abs(value - baselineAxes_finder[pad.index][i]);
                if ((delta > 0.15) && (now - lastInputTime > DEBOUNCE_MS)) 
                {
                    inputFilter.device = logicalDevice;

                    switch (i)
                    {
                        case 0: inputFilter.input = HandleLeftThumbStick_X(value); break;
                        case 1: inputFilter.input = HandleLeftThumbStick_Y(value); break;
                        case 2: inputFilter.input = HandleRightThumbStick_X(value); break;
                        case 3: inputFilter.input = HandleRightThumbStick_Y(value); break;
                    }

                    lastInputTime = now;
                    updatefilteredNames();
                }

                // Update previous axes value for next frame
                prevAxesValues[pad.index][i] = value;
            }
        }

        if (bindMode === "finder") requestAnimationFrame(listen);
        else
        {
            Object.assign(inputFilter, { input: "", device: "" });
        }
    }

    listen();
}
function findFromInput_MouseKeyboard()
{
    const DEBOUNCE_MS = 100;

    function handleKeyDown(e)
    {
        if (document.activeElement === keybindSearch) return; // <-- ignore if search is focused
        if (e.repeat) return;
        e.preventDefault();
        const now = performance.now();
        if (now - lastInputTime < DEBOUNCE_MS) return;

        let input = keyTranslationMap[e.code] || e.code;
        if (input.startsWith("Key")) input = input.slice(3).toLowerCase();
        inputFilter.input = input.toLowerCase();
        inputFilter.device = "keyboard";

        lastInputTime = now;
        updatefilteredNames();
    }

    function handleKeyUp(e)
    {
        if (document.activeElement === keybindSearch) return; // <-- ignore if search is focused
        inputFilter.input = "";
        inputFilter.device = "";
    }

    function handleMouseDown(e)
    {
        if (document.activeElement === keybindSearch) return; // <-- ignore if search is focused
        const now = performance.now();
        if (now - lastInputTime < DEBOUNCE_MS) return;

        let buttonName;
        switch (e.button)
        {
            case 0: buttonName = "mouse1"; break;
            case 1: buttonName = "mouse3"; break;
            case 2: buttonName = "mouse2"; break;
            default: buttonName = `mouse${ e.button }`; break;
        }
        if (buttonName !== "mouse1")
        {
            inputFilter.input = buttonName;
            inputFilter.device = 1;
            lastInputTime = now;
            updatefilteredNames();
        }
    }

    function handleMouseUp(e)
    {
        if (document.activeElement === keybindSearch) return; // <-- ignore if search is focused
        inputFilter.input = "";
        inputFilter.device = "";
    }

    function handleWheel(e)
    {
        if (document.activeElement === keybindSearch) return; // <-- ignore if search is focused
        const now = performance.now();
        if (now - lastInputTime < DEBOUNCE_MS) return;

        inputFilter.input = e.deltaY < 0 ? "mwheel_up" : "mwheel_down";
        inputFilter.device = 1;
        lastInputTime = now;
        updatefilteredNames();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel);

    // Cleanup function
    function disableMouseKeyboardFinder()
    {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("wheel", handleWheel);
        Object.assign(inputFilter, { input: "", device: "" });
    }

    // Monitoring loop to auto-cleanup
    function monitor()
    {
        if (bindMode === "binder" || InputState.current !== InputModeSelection.KEYBOARD)
        {
            disableMouseKeyboardFinder();
        } else
        {
            requestAnimationFrame(monitor);
        }
    }
    requestAnimationFrame(monitor);

    return disableMouseKeyboardFinder;
}




//#endregion

async function loadLocalisationJSON()
{
    try
    {
        const response = await fetch("./localisation.json");
        if (!response.ok) throw new Error(`HTTP ${ response.status }`);
        localisationData = await response.json();
    } catch (err)
    {
        console.error("Failed to load localisation.json:", err);
    }
}
function getLocalisedLabel(bindObject)
{
    const key = bindObject.label
    const bindActionName = bindObject.getActionName();
    const fallbackName = getActionLabel(bindActionName) || bindActionName;
    const cleanedKey = key?.startsWith("@")
        ? key.substring(1)
        : key;
    if (localisedLanguage === "english")
    {
        //this if() is here to force (if in english) the display of my curated keybinds.json names instead of 1:1 showing the in-game English labels
        return fallbackName || cleanedKey;

    }
    if (!localisationData) return bindObject?.getActionName() || cleanedKey;
    if (!localisationData[cleanedKey]) return bindObject?.getActionName() || cleanedKey;

    const value = localisationData[cleanedKey][localisedLanguage];
    if (value && value.trim() !== "")
    {
        return value;
    }

    // fallback to bindObject.getActionName()
    return fallbackName || cleanedKey;
}



const languageSelector = document.getElementById("languageSelector");

languageSelector.addEventListener("change", (e) =>
{
    localisedLanguage = e.target.value; // your global var for current language

    // If using Fuse, rebuild it for the new language:
    initFuse();

    // Optionally, re-render UI bindings with new localized labels
    showAllBinds(actionMapsMasterList);
});

languageSelector.dispatchEvent(new Event("change"));


///////////////////////////////
/////    Lazy-loading    //////
///////////////////////////////
window.addEventListener("load", (event) =>
{
    LoadFullQualityImages()
});

function LoadFullQualityImages()
{
    const imgTargets = document.querySelectorAll('img[data-src]');

    imgTargets.forEach(img =>
    {
        const highResSrc = img.dataset.src;
        img.src = highResSrc;

        img.addEventListener('load', () =>
        {
            img.classList.remove('lazy-img');
        });
    });

    document.querySelectorAll('.presetsBackground[data-bg]').forEach(el => el.style.backgroundImage = `url("${ el.dataset.bg }")`);
};

