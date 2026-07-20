/** Draft Assistant. Bound to the valuation spreadsheet; no external Sheets API. */
var RANGES = { settings: 'Settings!A1:S30', managers: 'Managers!A3:R15', players: 'Players!A3:AL923', auctionLog: 'Auction Log!A2:K300', dashboard: 'Dashboard!A1:K15' };
var POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];
var AUCTION_LOG_FIRST_DATA_ROW = 3;

function doGet() { return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Draft Assistant').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
function include(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }
function authorizeDraftAssistant() { getSpreadsheet_().getName(); return 'Draft Assistant is authorised.'; }
function getSpreadsheet_() { return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')); }
function text_(v) { return String(v === null || v === undefined ? '' : v).trim(); }
function number_(v) { var n = Number(String(v === null || v === undefined ? '' : v).replace(/[$,%]/g, '')); return isNaN(n) ? 0 : n; }
function row_(rows, i) { return rows[i] || []; }
function positionMap_(rows, i) { var r = row_(rows, i); return { minActive: number_(r[1]) || 1, maxActive: number_(r[2]) || 1, draftMinimum: number_(r[3]) || 1, maxSquad: number_(r[4]) || 3 }; }

function readDraftState() {
  var ss = getSpreadsheet_();
  var settingsRows = ss.getRange(RANGES.settings).getValues(), managersRows = ss.getRange(RANGES.managers).getValues(), playersRows = ss.getRange(RANGES.players).getValues(), logRows = ss.getRange(RANGES.auctionLog).getValues(), dashboardRows = ss.getRange(RANGES.dashboard).getValues();
  return { settings: parseSettings_(settingsRows), managers: parseManagers_(managersRows), players: parsePlayers_(playersRows), auctionLog: parseAuctionLog_(logRows), dashboard: parseDashboard_(dashboardRows), lastSync: new Date().toISOString() };
}
function parseSettings_(r) { return { season:text_(row_(r,3)[1]), managerCount:number_(row_(r,4)[1]), startingBudget:number_(row_(r,5)[1]), squadSize:number_(row_(r,6)[1]), activePlayers:number_(row_(r,7)[1]), benchPlayers:number_(row_(r,8)[1]), riskMode:text_(row_(r,9)[1]) || 'Balanced', userManagerName:text_(row_(r,11)[1]), totalDraftPicks:number_(row_(r,14)[1]), positions:{ GK:positionMap_(r,18), DEF:positionMap_(r,19), MID:positionMap_(r,20), FWD:positionMap_(r,21) } }; }
function parseManagers_(rows) { return rows.slice(2).filter(function(r){ return text_(r[1]) && text_(r[2]).toLowerCase() === 'yes'; }).map(function(r){ return { id:text_(r[0]), name:text_(r[1]), active:true, remainingBudget:number_(r[4]), playersDrafted:number_(r[5]), squadSpotsLeft:number_(r[6]), maxLegalBid:number_(r[7]), drafted:{GK:number_(r[8]),DEF:number_(r[9]),MID:number_(r[10]),FWD:number_(r[11])}, needs:{GK:number_(r[12]),DEF:number_(r[13]),MID:number_(r[14]),FWD:number_(r[15])}, dangerLevel:text_(r[17]) }; }); }
function parsePlayers_(rows) { return rows.slice(1).filter(function(r){return text_(r[0]) && text_(r[1]);}).map(function(r){ return { id:text_(r[0]),name:text_(r[1]),team:text_(r[2]),eligiblePos:text_(r[3]),lockedPos:text_(r[4]),tier:text_(r[5]),preference:number_(r[6]),reliability:number_(r[7]),avoidUnlessCheap:text_(r[8]),transferRisk:text_(r[9]),manualReview:text_(r[10]),points:number_(r[11]),adjustedDollarValue:number_(r[24]),marketDollarValue:number_(r[25]),status:text_(r[26]) || 'Available',openingBid:number_(r[29]),goodPrice:number_(r[30]),fairPrice:number_(r[31]),stretchPrice:number_(r[32]),hardMax:number_(r[33]),liveMaxBid:number_(r[34]),nominationType:text_(r[35]),nominationScore:number_(r[36]),notes:text_(r[37]) }; }); }
function parseAuctionLog_(rows) { return rows.slice(1).map(function(r,i){return {rowNumber:i + AUCTION_LOG_FIRST_DATA_ROW,pick:number_(r[0]),playerId:text_(r[1]),playerName:text_(r[2]),position:text_(r[3]),team:text_(r[4]),soldPrice:number_(r[5]),winningManager:text_(r[6]),expectedValue:number_(r[7]),vsValue:number_(r[8]),marketStatus:text_(r[9]),notes:text_(r[10])};}).filter(function(s){return s.playerId;}); }
function parseDashboard_(r) { return {currentPick:number_(row_(r,3)[1]),totalPicks:number_(row_(r,4)[1]),draftCompletion:number_(row_(r,5)[1]),userRemainingBudget:number_(row_(r,6)[1]),userMaxLegalBid:number_(row_(r,7)[1]),marketSpendIndex:number_(row_(r,8)[1]),marketStatus:text_(row_(r,9)[1]),userPlayersDrafted:number_(row_(r,11)[1]),firstTenAlert:text_(row_(r,12)[1])}; }

function validateSale_(input, state, excludedRow) {
  var errors=[], player=state.players.filter(function(p){return p.id === input.playerId;})[0], manager=state.managers.filter(function(m){return m.name === input.winningManager && m.active;})[0], position=input.position || (player && player.lockedPos), price=Number(input.soldPrice);
  if (!player) errors.push('Player does not exist.');
  if (player && player.status !== 'Available' && !excludedRow) errors.push('Player is no longer available.');
  if (!manager) errors.push('Winning manager is not active.');
  if (!Number.isInteger(price) || price < 1) errors.push('Sold price must be a whole dollar amount of at least $1.');
  if (manager && price > manager.maxLegalBid) errors.push('Sold price exceeds this manager’s current maximum legal bid.');
  if (manager && manager.squadSpotsLeft < 1) errors.push('Winning manager has no squad spaces remaining.');
  var options=player ? player.eligiblePos.split(/[\/, ]+/).filter(function(p){return POSITIONS.indexOf(p) >= 0;}) : [];
  if (player && !POSITIONS.includes(player.lockedPos) && options.length > 1 && !input.position) errors.push('Choose a locked position for this multi-position player.');
  if (POSITIONS.indexOf(position) < 0) errors.push('Selected position is invalid.');
  if (manager && POSITIONS.indexOf(position) >= 0) { if (manager.drafted[position] + 1 > state.settings.positions[position].maxSquad) errors.push('Sale would exceed ' + position + ' maximum squad count.'); if (!canCompleteMinimums_(manager, state.settings, position)) errors.push('Manager could not still satisfy all required draft minimums.'); }
  if (!excludedRow && state.auctionLog.some(function(s){return s.playerId === input.playerId;})) errors.push('Player is already present in Auction Log.');
  return {ok:!errors.length, errors:errors, player:player, position:position, price:price};
}
function canCompleteMinimums_(manager, settings, position) { var spaces=manager.squadSpotsLeft - 1, needed=0; POSITIONS.forEach(function(p){needed += Math.max(0, settings.positions[p].draftMinimum - manager.drafted[p] - (p === position ? 1 : 0));}); return needed <= spaces; }
function withLock_(work) { var lock=LockService.getDocumentLock(); if (!lock.tryLock(30000)) throw new Error('Another update is in progress. Please try again.'); try { return work(); } finally { lock.releaseLock(); } }
function nextEmptyLogRow_(ss) { var values=ss.getRange(RANGES.auctionLog).getValues(); for(var i=1;i<values.length;i++) if(!text_(values[i][1])) return AUCTION_LOG_FIRST_DATA_ROW + i - 1; throw new Error('No empty Auction Log row is available.'); }
function auctionRow_(input, check, dashboard, pick) { var p=check.player; return [pick,p.id,p.name,check.position,p.team,check.price,input.winningManager,p.adjustedDollarValue,check.price-p.adjustedDollarValue,dashboard.marketStatus,text_(input.notes)]; }
function confirmSale(input) { return withLock_(function(){ var state=readDraftState(), check=validateSale_(input,state); if(!check.ok) return {ok:false,errors:check.errors,state:state}; var row=nextEmptyLogRow_(getSpreadsheet_()); getSpreadsheet_().getRange('Auction Log!A'+row+':K'+row).setValues([auctionRow_(input,check,state.dashboard,state.auctionLog.length+1)]); SpreadsheetApp.flush(); Utilities.sleep(700); return {ok:true,errors:[],state:readDraftState()}; }); }
function undoLastSale() { return withLock_(function(){var state=readDraftState(), last=state.auctionLog[state.auctionLog.length-1]; if(!last) return {ok:false,errors:['No sale to undo.'],state:state}; getSpreadsheet_().getRange('Auction Log!A'+last.rowNumber+':K'+last.rowNumber).clearContent(); SpreadsheetApp.flush(); Utilities.sleep(500); return {ok:true,errors:[],state:readDraftState()};}); }
function editSale(rowNumber, input) { return withLock_(function(){var state=readDraftState(), old=state.auctionLog.filter(function(s){return s.rowNumber===rowNumber;})[0]; if(!old) return {ok:false,errors:['Sale row was not found.'],state:state}; input.playerId=old.playerId; var beforeEdit=JSON.parse(JSON.stringify(state)); beforeEdit.managers.forEach(function(m){if(m.name===old.winningManager){m.remainingBudget+=old.soldPrice;m.squadSpotsLeft++;m.playersDrafted--;m.drafted[old.position]=Math.max(0,m.drafted[old.position]-1);m.maxLegalBid=Math.max(0,m.remainingBudget-Math.max(0,m.squadSpotsLeft-1));}}); beforeEdit.auctionLog=beforeEdit.auctionLog.filter(function(s){return s.rowNumber!==rowNumber;}); var check=validateSale_(input,beforeEdit,rowNumber); if(!check.ok)return {ok:false,errors:check.errors,state:state}; getSpreadsheet_().getRange('Auction Log!A'+rowNumber+':K'+rowNumber).setValues([auctionRow_(input,check,state.dashboard,old.pick)]); SpreadsheetApp.flush(); Utilities.sleep(700); return {ok:true,errors:[],state:readDraftState()};}); }
function updateStrategyMode(mode) { return withLock_(function(){if(['Safe','Balanced','Upside'].indexOf(mode)<0) throw new Error('Invalid strategy mode.'); getSpreadsheet_().getRange('Settings!B10').setValue(mode); SpreadsheetApp.flush(); Utilities.sleep(500); return readDraftState();}); }
