// Later mission HUDs can hide the action chosen earlier by the shared HUD.
// Validate after every layer has refreshed so that its promoted copy cannot linger.
const interactionStableHUD=updatePolarHUD;
updatePolarHUD=()=>{interactionStableHUD();validateHUDInteraction();};
