(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const MAX_SLOTS = 24;
  const STORAGE_KEY = "spin-studio-simple-v2";
  const COLORS = ["#ad4b40", "#b97636", "#a88942", "#4f746c", "#4d7185", "#675a82", "#875368", "#637258"];
  const SPIN_LENGTHS = {
    regular: { label: "Regular", min: 3000, max: 8000 },
    medium: { label: "Medium", min: 8000, max: 14000 },
    long: { label: "Long", min: 14000, max: 22000 }
  };

  const EFFECTS = {
    reverse_spin: {
      label: "Spin again backwards",
      instruction: "The wheel will spin backwards automatically.",
      icon: "↶",
      auto: { direction: -1, speed: 1 }
    },
    double_speed: {
      label: "Spin again 2× speed",
      instruction: "The wheel will spin again twice as fast.",
      icon: "⚡",
      auto: { direction: 1, speed: 2 }
    },
    tiny_wheel: {
      label: "Tiny Wheel",
      instruction: "A ridiculously tiny wheel is taking over!",
      icon: "·",
      delay: 750,
      auto: { direction: 1, speed: 1, scale: .38, mode: "tiny" }
    },
    giant_wheel: {
      label: "GIANT WHEEL",
      instruction: "Make way for a wheel that is way too big!",
      icon: "↗",
      delay: 750,
      auto: { direction: 1, speed: 1, scale: 1.18, mode: "giant" }
    },
    move_three: {
      label: "Move 3 spaces",
      instruction: "MOVE FORWARD 3 SPACES",
      icon: "+3"
    },
    move_back_two: {
      label: "Move back 2 spaces",
      instruction: "MOVE BACK 2 SPACES",
      icon: "−2"
    },
    flip_wheel: {
      label: "Flip the wheel",
      instruction: "The order of every slot has been reversed.",
      icon: "⇄",
      action: "flip"
    },
    swap_places: {
      label: "Swap places",
      instruction: "SWAP PLACES WITH ANY PLAYER",
      icon: "⇆"
    },
    teacher_choice: {
      label: "Teacher's choice",
      instruction: "THE TEACHER CHOOSES WHAT HAPPENS",
      icon: "!"
    },
    double_reward: {
      label: "Double it",
      instruction: "DOUBLE THE REWARD OR POINTS",
      icon: "×2"
    }
  };

  const DEFAULT_SLOTS = [
    normalSlot("Prize Box"),
    normalSlot("Homework Pass"),
    normalSlot("Choose the Music"),
    wildcardSlot("reverse_spin"),
    normalSlot("Bonus Point"),
    normalSlot("VIP Seat"),
    wildcardSlot("move_three"),
    normalSlot("Mystery Prize")
  ];

  const dom = {
    title: document.querySelector("#wheelTitle"),
    canvas: document.querySelector("#wheelCanvas"),
    canvasWrap: document.querySelector(".canvas-wrap"),
    spinButton: document.querySelector("#spinButton"),
    spinLengthInputs: [...document.querySelectorAll('input[name="spinLength"]')],
    lastResult: document.querySelector("#lastResult"),
    editorToggle: document.querySelector("#editorToggle"),
    fullscreenButton: document.querySelector("#fullscreenButton"),
    addSlotForm: document.querySelector("#addSlotForm"),
    newSlotInput: document.querySelector("#newSlotInput"),
    wildcardSelect: document.querySelector("#wildcardSelect"),
    addWildcardButton: document.querySelector("#addWildcardButton"),
    slotCount: document.querySelector("#slotCount"),
    slotList: document.querySelector("#slotList"),
    shuffleButton: document.querySelector("#shuffleButton"),
    soundToggle: document.querySelector("#soundToggle"),
    resetButton: document.querySelector("#resetButton"),
    resultModal: document.querySelector("#resultModal"),
    resultCard: document.querySelector(".result-card"),
    resultKicker: document.querySelector("#resultKicker"),
    resultIcon: document.querySelector("#resultIcon"),
    resultName: document.querySelector("#resultName"),
    resultInstruction: document.querySelector("#resultInstruction"),
    autoStatus: document.querySelector("#autoStatus"),
    resultRemovalActions: document.querySelector("#resultRemovalActions"),
    removalHint: document.querySelector("#removalHint"),
    removeSliceButton: document.querySelector("#removeSliceButton"),
    removeMatchingButton: document.querySelector("#removeMatchingButton"),
    resultActionButton: document.querySelector("#resultActionButton"),
    closeResultButton: document.querySelector("#closeResultButton"),
    liveRegion: document.querySelector("#liveRegion")
  };

  const ctx = dom.canvas.getContext("2d");
  const saved = readSavedState();
  const state = {
    title: typeof saved.title === "string" ? saved.title : "Class Prize Wheel",
    slots: normalizeSavedSlots(saved.slots),
    sound: saved.sound !== false,
    spinLength: SPIN_LENGTHS[saved.spinLength] ? saved.spinLength : "regular",
    editorHidden: false,
    rotation: 0,
    spinning: false,
    elapsed: 0,
    spinDuration: 4000,
    plannedDuration: 4000,
    startRotation: 0,
    targetRotation: 0,
    selectedIndex: -1,
    selectedSlot: null,
    spinDirection: 1,
    spinSpeed: 1,
    wheelScale: 1,
    wheelMode: "normal",
    lastTickIndex: -1,
    chainDepth: 0,
    pendingEffect: null,
    effectCountdown: 0,
    particles: [],
    width: 720,
    height: 720,
    audioContext: null,
    raf: 0,
    lastFrameTime: 0
  };

  initialize();

  function initialize() {
    populateEffectSelect(dom.wildcardSelect, "reverse_spin");
    dom.title.value = state.title;
    dom.soundToggle.checked = state.sound;
    dom.spinLengthInputs.forEach((input) => { input.checked = input.value === state.spinLength; });
    bindEvents();
    renderSlotList();
    updateInterface();
    resizeCanvas();
    scheduleFrame();
  }

  function createId() {
    return typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalSlot(label) {
    return { id: createId(), label, type: "normal", effect: null };
  }

  function wildcardSlot(effectId) {
    const effect = EFFECTS[effectId] || EFFECTS.reverse_spin;
    return { id: createId(), label: effect.label, type: "wildcard", effect: effectId in EFFECTS ? effectId : "reverse_spin" };
  }

  function normalizeSavedSlots(slots) {
    if (!Array.isArray(slots) || slots.length < 2) return DEFAULT_SLOTS.map(cloneSlot);
    const normalized = slots.slice(0, MAX_SLOTS).map((slot) => {
      if (typeof slot === "string") return normalSlot(slot.slice(0, 42) || "Untitled slot");
      const type = slot && slot.type === "wildcard" ? "wildcard" : "normal";
      const effect = type === "wildcard" && EFFECTS[slot.effect] ? slot.effect : type === "wildcard" ? "reverse_spin" : null;
      return {
        id: typeof slot.id === "string" ? slot.id : createId(),
        label: String(slot.label || (effect ? EFFECTS[effect].label : "Untitled slot")).slice(0, 42),
        type,
        effect
      };
    });
    return normalized.length >= 2 ? normalized : DEFAULT_SLOTS.map(cloneSlot);
  }

  function cloneSlot(slot) {
    return { ...slot, id: createId() };
  }

  function readSavedState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_error) {
      return {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        title: state.title,
        slots: state.slots,
        sound: state.sound,
        spinLength: state.spinLength
      }));
    } catch (_error) {}
  }

  function bindEvents() {
    dom.title.addEventListener("input", () => {
      state.title = dom.title.value.slice(0, 48) || "Class Prize Wheel";
      saveState();
    });

    dom.addSlotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addNormalSlot();
    });

    dom.newSlotInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addNormalSlot();
    });

    dom.addWildcardButton.addEventListener("click", () => {
      if (state.slots.length >= MAX_SLOTS || state.spinning) return;
      state.slots.push(wildcardSlot(dom.wildcardSelect.value));
      afterSlotsChanged("Wildcard added.");
    });

    dom.slotList.addEventListener("input", (event) => {
      const input = event.target.closest(".slot-name");
      if (!input) return;
      const slot = findSlot(input.dataset.id);
      if (!slot) return;
      slot.label = input.value.slice(0, 42);
      const deleteButton = input.closest(".slot-row").querySelector(".delete-button");
      deleteButton.setAttribute("aria-label", `Delete ${slot.label || "untitled slot"}`);
      saveState();
      draw();
    });

    dom.slotList.addEventListener("focusout", (event) => {
      const input = event.target.closest(".slot-name");
      if (!input || input.value.trim()) return;
      const slot = findSlot(input.dataset.id);
      if (!slot) return;
      slot.label = "Untitled slot";
      input.value = slot.label;
      saveState();
      draw();
    });

    dom.slotList.addEventListener("change", (event) => {
      const select = event.target.closest(".effect-select");
      if (!select) return;
      const slot = findSlot(select.dataset.id);
      if (!slot || !EFFECTS[select.value]) return;
      slot.effect = select.value;
      slot.label = EFFECTS[select.value].label;
      afterSlotsChanged("Wildcard changed.");
    });

    dom.slotList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || state.spinning) return;
      const slot = findSlot(button.dataset.id);
      if (!slot) return;
      if (button.dataset.action === "delete") {
        if (state.slots.length <= 2) return;
        state.slots = state.slots.filter((candidate) => candidate.id !== slot.id);
        afterSlotsChanged("Slot removed.");
      } else if (button.dataset.action === "kind") {
        if (slot.type === "wildcard") {
          slot.type = "normal";
          slot.effect = null;
        } else {
          slot.type = "wildcard";
          slot.effect = "reverse_spin";
          slot.label = EFFECTS.reverse_spin.label;
        }
        afterSlotsChanged(slot.type === "wildcard" ? "Slot changed to a wildcard." : "Wildcard changed to a regular slot.");
      }
    });

    dom.shuffleButton.addEventListener("click", () => {
      if (state.spinning) return;
      for (let index = state.slots.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [state.slots[index], state.slots[swapIndex]] = [state.slots[swapIndex], state.slots[index]];
      }
      state.rotation = Math.random() * TAU;
      afterSlotsChanged("Slots shuffled.");
    });

    dom.soundToggle.addEventListener("change", () => {
      state.sound = dom.soundToggle.checked;
      saveState();
    });

    dom.spinLengthInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked || !SPIN_LENGTHS[input.value]) return;
        state.spinLength = input.value;
        saveState();
        announce(`${SPIN_LENGTHS[state.spinLength].label} spin selected.`);
      });
    });

    dom.resetButton.addEventListener("click", () => {
      if (state.spinning || !window.confirm("Reset every slot to the starter wheel?")) return;
      state.slots = DEFAULT_SLOTS.map(cloneSlot);
      state.title = "Class Prize Wheel";
      state.rotation = 0;
      dom.title.value = state.title;
      afterSlotsChanged("Starter wheel restored.");
    });

    dom.editorToggle.addEventListener("click", toggleEditor);
    dom.fullscreenButton.addEventListener("click", toggleFullscreen);
    dom.spinButton.addEventListener("click", () => startSpin());
    dom.canvas.addEventListener("click", () => startSpin());
    dom.resultActionButton.addEventListener("click", handleResultAction);
    dom.closeResultButton.addEventListener("click", handleResultAction);
    dom.removeSliceButton.addEventListener("click", () => clearSelectedSlots(false));
    dom.removeMatchingButton.addEventListener("click", () => clearSelectedSlots(true));
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("fullscreenchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    new ResizeObserver(resizeCanvas).observe(dom.canvasWrap);
  }

  function addNormalSlot() {
    const label = dom.newSlotInput.value.trim();
    if (!label || state.slots.length >= MAX_SLOTS || state.spinning) return;
    state.slots.push(normalSlot(label.slice(0, 42)));
    dom.newSlotInput.value = "";
    afterSlotsChanged("Slot added.");
    dom.newSlotInput.focus();
  }

  function afterSlotsChanged(message) {
    renderSlotList();
    updateInterface();
    saveState();
    draw();
    announce(message);
  }

  function findSlot(id) {
    return state.slots.find((slot) => slot.id === id);
  }

  function populateEffectSelect(select, selected) {
    select.replaceChildren(...Object.entries(EFFECTS).map(([id, effect]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = effect.label;
      option.selected = id === selected;
      return option;
    }));
  }

  function renderSlotList() {
    dom.slotList.replaceChildren(...state.slots.map((slot, index) => {
      const row = document.createElement("div");
      row.className = `slot-row${slot.type === "wildcard" ? " wildcard" : ""}`;

      const swatch = document.createElement("span");
      swatch.className = "slot-swatch";
      swatch.style.background = slot.type === "wildcard" ? "#ffd84d" : COLORS[index % COLORS.length];
      swatch.textContent = slot.type === "wildcard" ? "★" : "";
      swatch.setAttribute("aria-hidden", "true");

      const fields = document.createElement("div");
      fields.className = "slot-fields";
      const input = document.createElement("input");
      input.className = "slot-name";
      input.value = slot.label;
      input.maxLength = 42;
      input.dataset.id = slot.id;
      input.disabled = state.spinning;
      input.setAttribute("aria-label", `Slot ${index + 1} name`);
      fields.append(input);

      if (slot.type === "wildcard") {
        const select = document.createElement("select");
        select.className = "effect-select";
        select.dataset.id = slot.id;
        select.disabled = state.spinning;
        select.setAttribute("aria-label", `Slot ${index + 1} wildcard action`);
        populateEffectSelect(select, slot.effect);
        fields.append(select);
      }

      const kindButton = document.createElement("button");
      kindButton.className = "row-button kind-button";
      kindButton.type = "button";
      kindButton.dataset.action = "kind";
      kindButton.dataset.id = slot.id;
      kindButton.textContent = "★";
      kindButton.title = slot.type === "wildcard" ? "Make this a regular slot" : "Make this a wildcard";
      kindButton.setAttribute("aria-label", kindButton.title);

      const deleteButton = document.createElement("button");
      deleteButton.className = "row-button delete-button";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = slot.id;
      deleteButton.textContent = "×";
      deleteButton.disabled = state.slots.length <= 2 || state.spinning;
      deleteButton.setAttribute("aria-label", `Delete ${slot.label || `slot ${index + 1}`}`);

      row.append(swatch, fields, kindButton, deleteButton);
      return row;
    }));
  }

  function updateInterface() {
    const locked = state.spinning;
    dom.slotCount.textContent = `${state.slots.length} / ${MAX_SLOTS}`;
    dom.spinButton.disabled = locked || state.slots.length < 2 || state.effectCountdown > 0;
    dom.spinButton.querySelector("strong").textContent = locked ? "SPINNING…" : "SPIN";
    dom.spinLengthInputs.forEach((input) => { input.disabled = locked || state.effectCountdown > 0; });
    dom.newSlotInput.disabled = locked || state.slots.length >= MAX_SLOTS;
    dom.addSlotForm.querySelector("button").disabled = locked || state.slots.length >= MAX_SLOTS;
    dom.wildcardSelect.disabled = locked || state.slots.length >= MAX_SLOTS;
    dom.addWildcardButton.disabled = locked || state.slots.length >= MAX_SLOTS;
    dom.shuffleButton.disabled = locked;
    dom.slotList.querySelectorAll("input, select, button").forEach((control) => {
      const isDelete = control.classList.contains("delete-button");
      control.disabled = locked || (isDelete && state.slots.length <= 2);
    });
  }

  function toggleEditor() {
    state.editorHidden = !state.editorHidden;
    document.body.classList.toggle("editor-hidden", state.editorHidden);
    dom.editorToggle.textContent = state.editorHidden ? "Edit slots" : "Hide editor";
    window.setTimeout(resizeCanvas, 20);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => announce("Fullscreen is unavailable."));
    } else {
      document.exitFullscreen();
    }
  }

  function handleKeydown(event) {
    const tag = document.activeElement && document.activeElement.tagName;
    const editing = tag === "INPUT" || tag === "SELECT";
    if (event.code === "Space" && !editing && !state.spinning && !dom.resultModal.classList.contains("visible")) {
      event.preventDefault();
      startSpin();
    } else if (event.key.toLowerCase() === "f" && !editing) {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === "Escape" && dom.resultModal.classList.contains("visible")) {
      handleResultAction();
    }
  }

  function startSpin(options = {}) {
    if (state.spinning || state.slots.length < 2) return;
    const chained = options.chained === true;
    if (!chained) state.chainDepth = 0;
    else state.chainDepth += 1;

    hideResult();
    ensureAudio();
    state.spinning = true;
    state.selectedSlot = null;
    state.selectedIndex = Math.floor(Math.random() * state.slots.length);
    state.spinDirection = options.direction === -1 ? -1 : 1;
    state.spinSpeed = options.speed === 2 ? 2 : 1;
    state.wheelScale = Number.isFinite(options.scale) ? options.scale : 1;
    state.wheelMode = options.mode === "tiny" || options.mode === "giant" ? options.mode : "normal";
    state.elapsed = 0;
    state.lastTickIndex = Number.NaN;
    state.startRotation = state.rotation;

    const durationRange = SPIN_LENGTHS[state.spinLength];
    const baseDuration = randomDuration(durationRange.min, durationRange.max);
    state.plannedDuration = Math.round(baseDuration / state.spinSpeed);

    const arc = TAU / state.slots.length;
    const desired = -Math.PI / 2 - (state.selectedIndex + 0.5) * arc;
    const turns = Math.min(32, Math.max(5, Math.round(baseDuration / 700)));
    const directionalOffset = state.spinDirection === 1
      ? positiveModulo(desired - state.startRotation, TAU)
      : -positiveModulo(state.startRotation - desired, TAU);
    state.targetRotation = state.startRotation + state.spinDirection * turns * TAU + directionalOffset;

    state.spinDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? Math.min(state.plannedDuration, 850)
      : state.plannedDuration;
    dom.lastResult.textContent = state.wheelMode === "tiny"
      ? "Wildcard spin: tiny wheel"
      : state.wheelMode === "giant"
        ? "Wildcard spin: GIANT WHEEL"
        : state.spinDirection === -1
          ? "Wildcard spin: backwards"
          : state.spinSpeed === 2
            ? "Wildcard spin: 2× speed"
            : "Spinning…";
    updateInterface();
    announce(dom.lastResult.textContent);
    scheduleFrame();
  }

  function update(deltaMs) {
    if (state.spinning) {
      state.elapsed = Math.min(state.spinDuration, state.elapsed + deltaMs);
      const progress = state.elapsed / state.spinDuration;
      const eased = 1 - Math.pow(1 - progress, 5);
      state.rotation = state.startRotation + (state.targetRotation - state.startRotation) * eased;
      const tickIndex = Math.floor(Math.abs(state.rotation / TAU) * state.slots.length);
      if (tickIndex !== state.lastTickIndex) {
        state.lastTickIndex = tickIndex;
        playTick(progress);
      }
      if (progress >= 1) finishSpin();
    }

    if (!state.spinning && state.effectCountdown > 0) {
      state.effectCountdown = Math.max(0, state.effectCountdown - deltaMs);
      dom.autoStatus.textContent = state.pendingEffect && state.pendingEffect.mode === "tiny"
        ? "Tiny wheel launching…"
        : state.pendingEffect && state.pendingEffect.mode === "giant"
          ? "GIANT WHEEL launching…"
          : `Next spin starts in ${Math.max(1, Math.ceil(state.effectCountdown / 1000))}…`;
      if (state.effectCountdown === 0) executePendingEffect();
    }

    if (state.particles.length) {
      const step = deltaMs / 16.6667;
      state.particles = state.particles.filter((particle) => {
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.vy += 0.18 * step;
        particle.rotation += particle.spin * step;
        particle.life -= deltaMs;
        return particle.life > 0 && particle.y < state.height + 30;
      });
    }
  }

  function finishSpin() {
    state.spinning = false;
    state.rotation = positiveModulo(state.targetRotation, TAU);
    state.selectedSlot = state.slots[state.selectedIndex];
    makeConfetti();
    playWinnerChime();

    if (state.selectedSlot.type === "wildcard") {
      activateWildcard(state.selectedSlot);
    } else {
      state.pendingEffect = null;
      state.effectCountdown = 0;
      dom.lastResult.textContent = `Result: ${state.selectedSlot.label}`;
      showResult({
        wildcard: false,
        kicker: "RESULT",
        icon: "★",
        name: state.selectedSlot.label || "Untitled slot",
        instruction: "",
        automatic: false
      });
    }

    updateInterface();
    announce(`${state.selectedSlot.type === "wildcard" ? "Wildcard" : "Result"}: ${state.selectedSlot.label}`);
  }

  function activateWildcard(slot) {
    const effect = EFFECTS[slot.effect] || EFFECTS.reverse_spin;
    if (effect.action === "flip") {
      state.slots.reverse();
      state.rotation = positiveModulo(-state.rotation, TAU);
      renderSlotList();
      saveState();
    }

    const canAutoSpin = Boolean(effect.auto) && state.chainDepth < 3;
    state.pendingEffect = canAutoSpin ? { id: slot.effect, ...effect.auto } : null;
    state.effectCountdown = canAutoSpin ? (effect.delay || 1700) : 0;
    dom.lastResult.textContent = `Wildcard: ${effect.label}`;
    showResult({
      wildcard: true,
      kicker: "WILDCARD!",
      icon: effect.icon,
      name: effect.label,
      instruction: effect.auto && !canAutoSpin ? `${effect.instruction} Wildcard chain complete.` : effect.instruction,
      automatic: canAutoSpin
    });
  }

  function showResult({ wildcard, kicker, icon, name, instruction, automatic }) {
    dom.resultCard.classList.toggle("wildcard-card", wildcard);
    dom.resultCard.classList.toggle("long-result", String(name).length > 24);
    dom.resultCard.classList.toggle("very-long-result", String(name).length > 36);
    dom.resultKicker.textContent = kicker;
    dom.resultIcon.textContent = icon;
    dom.resultName.textContent = name;
    dom.resultInstruction.textContent = instruction || "";
    dom.resultInstruction.hidden = !instruction;
    dom.autoStatus.hidden = !automatic;
    dom.autoStatus.textContent = automatic && state.pendingEffect && state.pendingEffect.mode === "tiny"
      ? "Tiny wheel launching…"
      : automatic && state.pendingEffect && state.pendingEffect.mode === "giant"
        ? "GIANT WHEEL launching…"
        : automatic
          ? "Next spin starts in 2…"
          : "";
    updateResultRemovalActions(automatic);
    dom.resultActionButton.textContent = automatic ? "Spin now" : "Done";
    document.body.classList.add("result-open");
    dom.resultModal.classList.add("visible");
    dom.resultModal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => dom.resultActionButton.focus(), 40);
    scheduleFrame();
  }

  function hideResult() {
    document.body.classList.remove("result-open");
    dom.resultModal.classList.remove("visible");
    dom.resultModal.setAttribute("aria-hidden", "true");
  }

  function handleResultAction() {
    if (state.pendingEffect) executePendingEffect();
    else {
      state.wheelScale = 1;
      state.wheelMode = "normal";
      hideResult();
      draw();
      dom.spinButton.focus();
    }
  }

  function updateResultRemovalActions(automatic) {
    const matches = matchingSelectedSlots();
    const canRemoveOne = Boolean(state.selectedSlot) && state.slots.length > 2;
    const canRemoveAll = matches.length > 1 && state.slots.length - matches.length >= 2;
    dom.resultRemovalActions.hidden = automatic || !state.selectedSlot;
    dom.removeSliceButton.disabled = !canRemoveOne;
    dom.removeMatchingButton.disabled = !canRemoveAll;
    dom.removeMatchingButton.textContent = `Clear all matching (${matches.length})`;

    if (!canRemoveOne) {
      dom.removalHint.textContent = "The wheel needs at least 2 slices.";
    } else if (matches.length < 2) {
      dom.removalHint.textContent = "No other slices have the same text.";
    } else if (!canRemoveAll) {
      dom.removalHint.textContent = `${matches.length} match, but clearing all would leave fewer than 2 slices.`;
    } else {
      dom.removalHint.textContent = `${matches.length} slices have this same text.`;
    }
  }

  function matchingSelectedSlots() {
    if (!state.selectedSlot) return [];
    const selectedLabel = normalizedLabel(state.selectedSlot.label);
    return state.slots.filter((slot) => normalizedLabel(slot.label) === selectedLabel);
  }

  function clearSelectedSlots(clearAllMatching) {
    if (state.spinning || state.pendingEffect || !state.selectedSlot) return;
    const targets = clearAllMatching ? matchingSelectedSlots() : [state.selectedSlot];
    if (state.slots.length - targets.length < 2) {
      announce("Keep at least 2 slices on the wheel.");
      return;
    }

    const targetIds = new Set(targets.map((slot) => slot.id));
    state.slots = state.slots.filter((slot) => !targetIds.has(slot.id));
    state.selectedSlot = null;
    state.selectedIndex = -1;
    state.wheelScale = 1;
    state.wheelMode = "normal";
    hideResult();
    renderSlotList();
    updateInterface();
    saveState();
    draw();
    dom.lastResult.textContent = targets.length === 1 ? "Landed slice cleared." : `${targets.length} matching slices cleared.`;
    announce(dom.lastResult.textContent);
    dom.spinButton.focus();
  }

  function executePendingEffect() {
    if (!state.pendingEffect || state.spinning) return;
    const pending = state.pendingEffect;
    state.pendingEffect = null;
    state.effectCountdown = 0;
    hideResult();
    startSpin({
      direction: pending.direction,
      speed: pending.speed,
      scale: pending.scale,
      mode: pending.mode,
      chained: true
    });
  }

  function ensureAudio() {
    if (!state.sound || state.audioContext) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) state.audioContext = new AudioContext();
    } catch (_error) {
      state.audioContext = null;
    }
  }

  function playTick(progress) {
    if (!state.sound || !state.audioContext || progress > .995) return;
    try {
      const now = state.audioContext.currentTime;
      const oscillator = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(520 - progress * 130, now);
      gain.gain.setValueAtTime(.014, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .03);
      oscillator.connect(gain).connect(state.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + .035);
    } catch (_error) {}
  }

  function playWinnerChime() {
    if (!state.sound || !state.audioContext) return;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      try {
        const now = state.audioContext.currentTime + index * .09;
        const oscillator = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(.001, now);
        gain.gain.exponentialRampToValueAtTime(.07, now + .02);
        gain.gain.exponentialRampToValueAtTime(.001, now + .38);
        oscillator.connect(gain).connect(state.audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + .42);
      } catch (_error) {}
    });
  }

  function makeConfetti() {
    for (let index = 0; index < 80; index += 1) {
      const angle = Math.random() * Math.PI - Math.PI;
      const speed = 4 + Math.random() * 9;
      state.particles.push({
        x: state.width / 2,
        y: state.height * .25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        width: 4 + Math.random() * 7,
        height: 3 + Math.random() * 4,
        color: COLORS[index % COLORS.length],
        rotation: Math.random() * TAU,
        spin: (Math.random() - .5) * .35,
        life: 1700 + Math.random() * 1200
      });
    }
  }

  function resizeCanvas() {
    const rect = dom.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    dom.canvas.width = Math.round(rect.width * dpr);
    dom.canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const { width, height } = state;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#111415";
    roundedRect(ctx, 0, 0, width, height, Math.min(6, width * .02));
    ctx.fill();

    ctx.save();
    roundedRect(ctx, 0, 0, width, height, Math.min(6, width * .02));
    ctx.clip();
    ctx.strokeStyle = "rgba(235,229,216,.035)";
    ctx.lineWidth = 1;
    for (let offset = -height; offset < width + height; offset += 27) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset - height, height);
      ctx.stroke();
    }
    ctx.restore();

    const centerX = width / 2;
    const centerY = height / 2 + height * (state.wheelMode === "giant" ? .03 : .012);
    const radius = Math.min(width, height) * .4 * state.wheelScale;
    drawWheel(centerX, centerY, radius);
    drawPointer(centerX, centerY, radius);
    drawParticles();
  }

  function drawWheel(centerX, centerY, radius) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.62)";
    ctx.shadowBlur = radius * .11;
    ctx.shadowOffsetY = radius * .065;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 9, 0, TAU);
    ctx.fillStyle = "#050708";
    ctx.fill();
    ctx.lineWidth = Math.max(2, radius * .012);
    ctx.strokeStyle = "#555a58";
    ctx.stroke();
    ctx.restore();

    const arc = TAU / state.slots.length;
    state.slots.forEach((slot, index) => {
      const start = state.rotation + index * arc;
      const end = start + arc;
      const color = slot.type === "wildcard" ? "#bd9138" : COLORS[index % COLORS.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, radius * .008);
      ctx.strokeStyle = "rgba(8,10,11,.72)";
      ctx.stroke();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(8,10,11,.075)";
      ctx.lineWidth = Math.max(1, radius * .004);
      const stripeGap = Math.max(10, radius * .075);
      for (let stripe = centerX - radius * 2; stripe < centerX + radius * 2; stripe += stripeGap) {
        ctx.beginPath();
        ctx.moveTo(stripe, centerY - radius * 1.25);
        ctx.lineTo(stripe + radius * .7, centerY + radius * 1.25);
        ctx.stroke();
      }
      ctx.restore();
      drawSegmentText(slot, start + arc / 2, centerX, centerY, radius, arc, color);
    });

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, TAU);
    ctx.lineWidth = Math.max(4, radius * .022);
    ctx.strokeStyle = "#07090a";
    ctx.stroke();

    for (let bolt = 0; bolt < 12; bolt += 1) {
      const boltAngle = bolt / 12 * TAU;
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(boltAngle) * (radius + 4),
        centerY + Math.sin(boltAngle) * (radius + 4),
        Math.max(1.4, radius * .007),
        0,
        TAU
      );
      ctx.fillStyle = "rgba(232,227,217,.34)";
      ctx.fill();
    }

    const hubRadius = radius * .2;
    ctx.shadowColor = "rgba(0,0,0,.48)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, TAU);
    ctx.fillStyle = "#ddd7cb";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(3, radius * .017);
    ctx.strokeStyle = "#07090a";
    ctx.stroke();
    ctx.fillStyle = "#111415";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `950 ${Math.max(13, radius * .075)}px "Arial Narrow", "Avenir Next Condensed", sans-serif`;
    const hubText = state.spinning
      ? state.wheelMode === "tiny"
        ? "tiny!"
        : state.wheelMode === "giant"
          ? "GIANT!"
          : state.spinDirection === -1
            ? "BACK!"
            : state.spinSpeed === 2
              ? "2×!"
              : "GO!"
      : "SPIN";
    ctx.fillText(hubText, centerX, centerY - 1);
    ctx.restore();
  }

  function drawSegmentText(slot, angle, centerX, centerY, radius, arc, color) {
    const normalized = positiveModulo(angle, TAU);
    const flip = normalized > Math.PI / 2 && normalized < Math.PI * 1.5;
    const rawLabel = `${slot.type === "wildcard" ? "★ " : ""}${slot.label || "Untitled"}`.toUpperCase();
    const maxCharacters = state.slots.length > 16 ? 10 : state.slots.length > 10 ? 14 : 19;
    const label = rawLabel.length > maxCharacters ? `${rawLabel.slice(0, maxCharacters - 1)}…` : rawLabel;
    const fontSize = Math.max(9, Math.min(radius * .061, arc * radius * .22));

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.textAlign = flip ? "left" : "right";
    if (flip) ctx.rotate(Math.PI);
    ctx.textBaseline = "middle";
    ctx.font = `${slot.type === "wildcard" ? 950 : 900} ${fontSize}px "Arial Narrow", "Avenir Next Condensed", sans-serif`;
    const lightText = colorLuminance(color) < .42;
    ctx.fillStyle = lightText ? "#f0ebe1" : "#111415";
    ctx.shadowColor = lightText ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.18)";
    ctx.shadowBlur = 2;
    ctx.fillText(label, flip ? -radius + radius * .1 : radius - radius * .1, 1, radius * .7);
    ctx.restore();
  }

  function drawPointer(centerX, centerY, radius) {
    const top = centerY - radius;
    const pointerWidth = state.wheelMode === "tiny" ? Math.max(8, radius * .11) : Math.max(20, radius * .11);
    const pointerHeight = state.wheelMode === "tiny"
      ? Math.max(14, radius * .17)
      : state.wheelMode === "giant"
        ? Math.max(28, radius * .12)
        : Math.max(34, radius * .17);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.52)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, top + pointerHeight * .7);
    ctx.lineTo(centerX - pointerWidth, top - pointerHeight * .45);
    ctx.quadraticCurveTo(centerX, top - pointerHeight * .8, centerX + pointerWidth, top - pointerHeight * .45);
    ctx.closePath();
    ctx.fillStyle = "#ddd7cb";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(3, radius * .014);
    ctx.strokeStyle = "#07090a";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, top - pointerHeight * .42, pointerWidth * .22, 0, TAU);
    ctx.fillStyle = "#c84d3f";
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    state.particles.forEach((particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
      ctx.restore();
    });
    ctx.restore();
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function randomDuration(min, max) {
    return Math.round((min + Math.random() * (max - min)) / 100) * 100;
  }

  function normalizedLabel(label) {
    return String(label || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
  }

  function colorLuminance(hexColor) {
    const hex = hexColor.replace("#", "");
    const channels = [0, 2, 4].map((offset) => {
      const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return channel <= .03928 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4);
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }

  function scheduleFrame() {
    if (!state.raf) state.raf = requestAnimationFrame(frame);
  }

  function frame(timestamp) {
    state.raf = 0;
    const delta = state.lastFrameTime ? Math.min(40, timestamp - state.lastFrameTime) : 16.6667;
    state.lastFrameTime = timestamp;
    update(delta);
    draw();
    if (state.spinning || state.effectCountdown > 0 || state.particles.length) scheduleFrame();
  }

  function announce(message) {
    dom.liveRegion.textContent = "";
    window.setTimeout(() => { dom.liveRegion.textContent = message; }, 20);
  }

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.ceil(ms / (1000 / 60)));
    const step = ms / steps;
    for (let index = 0; index < steps; index += 1) update(step);
    draw();
  };

  window.render_game_to_text = () => JSON.stringify({
    coordinateSystem: "Canvas origin is top-left; x increases right and y increases down. Pointer is at 12 o'clock.",
    mode: state.spinning ? "spinning" : state.effectCountdown > 0 ? "wildcard_countdown" : dom.resultModal.classList.contains("visible") ? "result" : "ready",
    title: state.title,
    slots: state.slots.map((slot, index) => ({ index, label: slot.label, type: slot.type, effect: slot.effect })),
    spin: {
      length: state.spinLength,
      direction: state.spinDirection === -1 ? "backward" : "forward",
      speed: state.spinSpeed,
      visualMode: state.wheelMode,
      scale: state.wheelScale,
      durationMs: state.spinDuration,
      plannedDurationMs: state.plannedDuration,
      progress: state.spinning ? Number((state.elapsed / state.spinDuration).toFixed(3)) : 0,
      chainDepth: state.chainDepth
    },
    selected: state.selectedSlot ? { label: state.selectedSlot.label, type: state.selectedSlot.type, effect: state.selectedSlot.effect } : null,
    pendingEffect: state.pendingEffect,
    editorHidden: state.editorHidden,
    controls: "Choose Regular, Medium, or Long. Click the wheel or SPIN, or press Space. After a result, clear the landed slice or every matching label. Press F for fullscreen."
  });
})();
