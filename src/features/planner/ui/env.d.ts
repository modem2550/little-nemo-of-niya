/// <reference types="astro/client" />

declare global {
    interface Window {
        APP: {
            switchTab: (tabId: string) => void;
            toggleMember: (btn: HTMLElement) => void;
            removeMember: (name: string) => void;
            changeRounds: (...args: any[]) => void;
            setRoundsFromInput: (input: HTMLInputElement) => void;
            resetAll: () => void;
            removeFromCart: (sid: string) => void;
            setSort: (key: string) => void;
            toggleSortMenu: () => void;
            exportRecap: () => Promise<void>;
        };
        toggleFromMembersTab: (btn: HTMLElement) => void;
    }

    interface HTMLElement {
        disabled?: boolean;
    }

    interface HTMLInputElement {
        dataset: DOMStringMap;
        value: string;
    }
}

export { };