export const SHEET_ID_ENV='GOOGLE_SHEETS_SPREADSHEET_ID';
export const SHEETS={settings:'Settings',managers:'Managers',players:'Players',auctionLog:'Auction Log',dashboard:'Dashboard'} as const;
export const RANGES={settings:'Settings!A1:S30',managers:'Managers!A3:R15',players:'Players!A3:AL923',auctionLog:'Auction Log!A2:K300',dashboard:'Dashboard!A1:K15',strategyMode:'Settings!B10'} as const;
export const AUCTION_LOG_START_ROW=2;
export const AUCTION_LOG_FIRST_DATA_ROW=3;
