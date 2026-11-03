// Lets any part of the shop (the side navbar, the phone drawer) open the chat
// assistant without sharing state: AssistantChat listens for this event.
export const OPEN_ASSISTANT_EVENT = 'bazar-buddy:open-assistant';

export const openAssistant = () => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
