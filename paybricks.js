(function () {

    console.log('PB loaded');
    
    const meScript = document.getElementById('paybricksScript');
    
    if (!meScript) {
        throw new Error('no paybricks script element');
    }
    
    const clientId = meScript.getAttribute('src').split('clientId=')[1];
    const injectedSimulation = meScript.getAttribute('src').indexOf('simulation') > -1;
    
    // to protect paybricks brand, first blogs must be approved for use
    if (!injectedSimulation) {
        if (clientId !== 'approved-client-id') {
            return;
        }
    }
    
    const urlQueryParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    
    const uuidv4 = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    
    const getPaperBiteConfig = () => {
        if (!window.localStorage.getItem('paperbiteConfig')) {
            const globalUuid = uuidv4();
            window.localStorage.setItem('paperbiteConfig', JSON.stringify({
                globalUuid
            }));
        }
    
        return JSON.parse(window.localStorage.getItem('paperbiteConfig'));
    };
    
    const getLocalStorageItem = () => {
        const urlSafe = encodeURIComponent(
            document.location.href
                .split('?')[0]
                .replaceAll('/', '')
                .replaceAll(':', '')
        );
    
        const localStorageItem = window.localStorage.getItem(`PB-${urlSafe}`);
    
        if (localStorageItem && document.location.href.split('?')[1]?.includes('pbForceTest=true')) {
            setTimeout(() => {
                window.localStorage.removeItem(`PB-${urlSafe}`);
            }, 20000);
        }
    
        const item = JSON.parse(localStorageItem ? localStorageItem : '{}');
    
        return item;
    }
    
    const setLocalStorageItem = (item) => {
        const urlSafe = encodeURIComponent(
            document.location.href
                .split('?')[0]
                .replaceAll('/', '')
                .replaceAll(':', '')
        );
    
        window.localStorage.setItem(`PB-${urlSafe}`, JSON.stringify(item));
    }
    
    if (window.location.search.includes('pbReset')) {
        console.log('pb reset');
        setLocalStorageItem({});
        window.localStorage.removeItem('paperbiteConfig');
    }
    
    getPaperBiteConfig();
    
    const pbUuid = getLocalStorageItem()?.uuid || uuidv4();
    
    setLocalStorageItem({
        ...getLocalStorageItem(),
        uuid: pbUuid
    });
    
    let globalPbVisitorInfo = null;
    
    const getOverridesConfig = () => {
        const urlParams = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
    
        if (urlParams?.forcePayBricksSale === 'true') {
            return JSON.parse(window.atob('eyJtb25ldGl6YXRpb25SZXNwb25zZSI6eyJ0eXBlIjoicHVyY2hhc2UiLCJjdXJyZW5jeSI6InVzZCIsInB1cmNoYXNlIjp7InNhbGVNZXNzYWdlIjoiUGxlYXNlIHN1cHBvcnQgdXMgYnkgcHVyY2hhc2luZyB0aGUgcmVzdCBvZiB0aGlzIHBvc3QsIG9yIHNraXAgYnkgdGFwcGluZyBiZWxvdzoiLCJwb3NpdGlvbiI6MC44LCJwcmljZSI6OTksInByaWNlQnJpY2tvc2hpIjoxMDAwMDAwLCJza2lwV2FpdCI6MCwiZGlzYWJsZVNpbmdsZVB1cmNoYXNlIjp0cnVlLCJ3YWxsZXRQdXJjaGFzZUFtb3VudCI6MSwiYnJpY2tzQ29zdCI6eyJ1c2QiOjEwMH0sIndhbGxldERpc2NvdW50IjowLjEsIndyYXBXYWxsZXRIdG1sV2l0aENvbnNlbnQiOnRydWUsInVwc2FsZSI6W3sidHlwZSI6ImFtb3VudCIsImFtb3VudCI6MywicHJpY2UiOjJ9LHsidHlwZSI6InN1YnNjcmlwdGlvbiIsInRpbWUiOjEyLCJwcmljZSI6NTB9XSwidXNlQnJpY2tzIjp0cnVlfSwicGFnZUhpdENsaWVudElkIjoiNzE0YzEwZTItMzA5Zi00ZTJiLWJiNDctOGQ0MmM1NWI5N2JhIn0sImdldEV4ZWN1dGlvblBhcmFtc1Jlc3BvbnNlIjp7InByb2NlZWQiOnRydWV9fQ=='));
        }
        
        return urlParams?.paperbiteOverrides ? 
            JSON.parse(window.atob(urlParams.paperbiteOverrides)) : {};
    };
    
    
    var observeDOM = (function () {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    
        return function (obj, callback) {
            if (!obj || obj.nodeType !== 1) return;
    
            if (MutationObserver) {
                // define a new observer
                var mutationObserver = new MutationObserver(callback)
    
                // have the observer observe foo for changes in children
                mutationObserver.observe(obj, { childList: true, subtree: true })
                return mutationObserver
            }
    
            // browser support fallback
            else if (window.addEventListener) {
                obj.addEventListener('DOMNodeInserted', callback, false)
                obj.addEventListener('DOMNodeRemoved', callback, false)
            }
        }
    })();
    
    // const monetizationResponse = {
    //     type: 'donation',
    //     currency: 'USD',
    //     donation: {
    //         options: [1, 2],
    //         allowManualAmount: true,
    //         positions: [0.0, 0.4]
    //     }
    // };
    // const monetizationResponse = {
    //     type: 'purchase',
    //     currency: 'USD',
    //     purchase: {
    //         position: 0.6,
    //         price: 1,
    //         skipWait: 10, // if defined, # of seconds
    //         upsale: [{
    //             type: 'amount',
    //             amount: 3,
    //             price: 2
    //         }, {
    //             type: 'subscription',
    //             time: 12, // 1-year,
    //             price: 50
    //         }]
    //     }
    // };
    
    const getEntryContent = () => {
    
        // assumes wpcode "insert after content" settings
        return meScript.parentElement;
    
        // legacy
        const divs = document.getElementsByClassName('entry-content');
    
        if (divs.length === 1) {
            return divs[0];
        }
    
        const articles = Array.from(document.getElementsByTagName('article'))
            .filter(article => {
                console.log('article height', article.clientHeight);
                return true;
            })
            .sort((a, b) => {
                return b.clientHeight - a.clientHeight;
            });
    
        const postArticles = articles
            .filter(article => article.classList.contains('post'));        
    
        if (postArticles.length > 0) {
            return postArticles[0];
        }
        
        const articlesWithNoClass = articles;
    
        if (articlesWithNoClass.length > 0) {
            return articlesWithNoClass[0];
        }
    
        const mainElements = document.getElementsByTagName('main');
    
        if (mainElements.length > 0) {
            return mainElements[0];
        }
    
        console.error('cannot find post');
    
        return null;
    };
    
    const applyDonationMonetization = ({ currency, donation }) => {
        console.log(currency, donation);
    }
    
    const limitElementToPercentage = (el, percentage) => {
    
        let intervalHandle;
    
        const updateHeight = () => {
            if (document.body.contains(el)) {
                el.style.height = Math.floor(el.scrollHeight * percentage).toString() + 'px';
            } else {
                console.warn('Element no longer child of document body');
                clearInterval(intervalHandle);
            }
        };
    
        intervalHandle = setInterval(updateHeight, 100);
    
        el.pbIntervalHandle = intervalHandle;
    
        el.style['overflow-y'] = 'hidden';
    };
    
    const getWalletHtml = purchase => {
        if (purchase.walletPurchaseAmount || true) {
            const retHtml = [];
    
            if (purchase.walletPurchaseBonus) {
    
                retHtml.push(
                    `<div class="button buttonPbWallet singlePurchase" id="buyPaybricksCredit" style="position: relative;">
                        <div style="position: absolute; right: 7px; top: 7px">
                            <img src="https://app.paybricks.io/wp/bricks.png" style="width: 25px; height: 25px;">
                        </div>
                        <div>Buy $${purchase.walletPurchaseAmount} Credit + $${purchase.walletPurchaseBonus} Bonus!</div>
                        <div style="
                            font-size: 11px;
                        ">Use your $${(purchase.walletPurchaseAmount + purchase.walletPurchaseBonus)} on any site with PayBricks</div>
                    </div>`
                );
            } else {
    
                let bigMsg = `Buy $${purchase.walletPurchaseAmount} Credit`;
    
                if (purchase?.useBricks) {
                    const bricksCost = purchase.bricksCost;
                    const bricks = Number(purchase.walletPurchaseAmount) / bricksCost.usd;
                    // bigMsg = `Buy ${(bricks * 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} mBricks for $${purchase.walletPurchaseAmount}`;
                    bigMsg = 'Get PayBricks.io Wallet'
                }
    
                const smallMsg = `Support content creators and gain quick access`;
    
                // disabled, wallet iframe enough
                /*
                retHtml.push(
                    `<div class="button buttonPbWallet singlePurchase" id="buyPaybricksCredit" style="position: relative;">
                        <div style="position: absolute; right: 7px; top: 7px">
                            <img src="https://app.paybricks.io/wp/paybricks-tiny.png" style="width: 25px; height: 25px;">
                        </div>
                        <div>${bigMsg}</div>
                        <div style="
                            font-size: 11px;
                        ">${smallMsg}</div>
                    </div>`
                
                );
                */
            }
    
            const priceStr = `$${purchase.price / 100}`;
    
            retHtml.push(
                `<div id="usePaybricksWalletIframe" style="max-height: 65px"></div>`
            );
    
            // retHtml.push(
            //     `<div class="button buttonPbWallet singlePurchase" id="usePaybricksCredit"  style="position: relative;">
            //         <div style="position: absolute; left: 10px; top: 22px">
            //             <img src="https://app.paybricks.io/wp/paybricks-tiny.png" style="width: 30px; height: 30px;">
            //         </div>
            //         <div>Use PayBricks Wallet</div>
            //         <div style="
            //             font-size: 11px;
            //         ">${priceStr} will be deducted from your balance</div>
            //     </div>`
            // );
    
            const walletHtml = retHtml.join('');
    
            if (purchase?.wrapWalletHtmlWithConsent) {
                return [
                    //`<div class="button buttonPrimary singlePurchase" id="consentToPurchaseDiv" style="line-height: 48px">Tap to Purchase</div>`,
                    //'<div id="pbWalletHtmlWrapper" class="hidden">',
                    walletHtml
                    //'</div>'
                ].join('');
            } else {
                return walletHtml;
            }
        }
    
        return ``;
    }
    
    const getSkipHtml = purchase => {
    
        if (purchase.skipWait || purchase.skipWait === 0) {
            return `
            <div class="buttonWrapper">
                <div style="line-height: 40px" 
                    class="button buttonSecondary skipPurchase ${purchase.skipWait > 0 ? 'skipPurchaseCountdown' : ''}" id="skipPurchaseDiv">
                    ${purchase.skipWait > 0 ? 'Skip payment (please wait ' + purchase.skipWait + ' seconds)' : 'I do not wish to support'}
                </div>
            </div>
        `;
        }
    
        return null;
    };
    
    const getSubscriptionHtml = purchase => {
    
        if (purchase.upsale) {
    
            const buttons = purchase.upsale
                .filter(({type}) => type === 'subscription')
                .map(({time, price}) => {
                    const timeStr = time === 12 ? 'year' : 'month';
                    return `
                    <div 
                        class="button buttonPrimary singlePurchase">
                            Keep reading for $${(purchase.price / 100)}
                    </div>
                    `;
                })
    
            return `
            <div class="buttonWrapper">
                <div class="button buttonSecondary skipPurchase skipPurchaseCountdown" id="skipPurchaseDiv">
                    I do not wish to support (${purchase.skipWait})
                </div>
            </div>
        `;
        }
    
        return null;
    };
    
    const goToApp = (forceLocalhost) => {
        const currentAddress = document.location.href.split('?')[0];
        const currentAddressSafe = encodeURIComponent(currentAddress);
        const urlParams = JSON.stringify({
            globalUuid: getPaperBiteConfig()?.globalUuid,
            purchaseUuid: pbUuid,
            url: document.location.href.split('?')[0],
            // customerEmail: 'something@something.com',
            returnUrl: currentAddress,
            buyPaybricksCredit: true,
            // price: purchase.price,
            // priceBrickoshi: purchase.priceBrickoshi,
            tempSession: getPaperBiteConfig()?.globalUuid,
            isStripeTest: !!document.getElementById('paperbiteSimulationScript') || window.localStorage.getItem('pbForceStripeTest') === 'true'
        });
    
        if (!!document.getElementById('paperbiteSimulationScript')) {
            // alert('(Simulation mode) You will be redirected to open an account with PayBricks. Credit purchase currently unsupported.');
        }
    
        const locationPrefix = forceLocalhost ? 'http://localhost:4200' : 'https://app.paybricks.io'
        
        document.location.href = `${locationPrefix}/?redirectPayload=${btoa(urlParams)}`;
    }
    
    const showPurchasePrompt = (el, purchase, currency, pageHitClientId) => {
    
        const skipHtml = getSkipHtml(purchase);
        const walletHtml = getWalletHtml(purchase);
        const subscriptionHtml = null; //getSubscriptionHtml(purchase);
    
        const priceStr = `$${purchase.price / 100}`;
        // const priceStr = purchase.price / 100 < 1 ? `${purchase.price}¢` : `$${purchase.price / 100}`;
    
        const singlePurchaseHtml = `<div class="button buttonPrimary singlePurchase" id="singlePurchaseButton" style="line-height: 40px">Keep reading for ${priceStr}</div>`;
    
        const thePrompt = document.createElement('div');
        thePrompt.id = 'thePrompt-' + pbUuid;
        thePrompt.classList.add('thePrompt');
        // thePrompt.style.height = thePromptHeight + 'px';
        // thePrompt.style.top = (el.clientHeight - thePromptHeight) + 'px';
        console.log('sale', purchase.saleMessage);
        const saleMessage = purchase.saleMessage.replaceAll('{{price}}', priceStr);
        console.log(saleMessage);
        //     <script src="https://js.stripe.com/v3/"></script>
        thePrompt.innerHTML = `    
        <div class="opacityTransition"></div>
        <div class="centerPrompt">
            <div class="theActualPrompt">
                <div>
                    <p>${saleMessage}</p>
                </div>
                <div class="optionsWrapper">
                    ${subscriptionHtml ?? ''}
                    ${!purchase.disableSinglePurchase ? singlePurchaseHtml : ''}
                    ${walletHtml ?? ''}
                    ${skipHtml ?? ''}
                </div>
                <div class="redeemWrapper">
                    <p>
                        ${purchase.price > 0 && !!walletHtml ? 'Already bought this? Tap the "Buy" button above to log in to your account. You will not be charged again.' : ''}
                        <!--Type the purchase code below (found in your confirmation e-mail or card statement). Questions? contact support@paybricks.io-->
                    </p>
                    <!--div class="redeemInputWrapper">
                        <form>
                            <input type="text" id="pbRedeemInput" placeholder="PB-xxxx-xxxx">
                        </form>
                    </div>
                    <div id="pbRedeemError" class="hidden">
                        We were unable to use this code. Please make sure you entered your code correctly, or get in touch with us using the contact page.
                    </div-->
                </div>
                <!--div class="lastLine"></div-->        
            </div>
        </div>
    `;
    
        el.style.position = 'relative';
        const wrapper = document.createElement('div');
        wrapper.id = `pbWrapper-${pbUuid}`;
        el.appendChild(wrapper);
    
        const stripeContainer = document.createElement('div');
        stripeContainer.innerHTML = `
            <div class="__paybricksStripeOverlay" id="__paybricksStripeOverlay">
                <div class="__paybricksStripeContainer">
                    <div id="__paybricksClose"></div>
                    <div id="__paybricksStripeOverlayPleaseWait">Just a moment...</div>
                    <form id="__paybricks-payment-form">
                        <div id="__paybricks-payment-element">
                            <!-- Elements will create form elements here -->
                        </div>
                        <div class="__paybricksButton __paybricksButtonPrimary __paybricksHidden" id="__paybricksCompletePurchase" style="line-height: 48px">
                            Buy for ${priceStr}
                        </div>
                        <div id="__paybricks-error-message">
                            <!-- Display error message to your customers here -->
                        </div>
                    </form>
                </div>
            </div>    
        `;
        el.appendChild(stripeContainer);
    
        const shadowStyle = document.createElement('style');
        shadowStyle.innerHTML = `
    
    .opacityTransition {
        // background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255,255,255,0)), to(rgba(255,255,255,1)),color-stop(.4,#ffffff));
        // background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255,255,255,0)), to(rgba(255,255,255,1)));
        // background-image: -webkit-linear-gradient(left top, left bottom, from(rgba(255,255,255,0)), to(rgba(255,255,255,1)));
        //background: -webkit-linear-gradient(top, from(rgba(255,255,255,0)), to(rgba(255,255,255,1)));
        background: linear-gradient(to bottom, rgba(255,255,255,0),rgba(255,255,255,1));
        // background: -webkit-linear-gradient(rgba(255,255,255,0),rgba(255,255,255,1));
        width: 100%;
        height: 250px;
    }
    
    .thePrompt {
        left: 0px;
        position: absolute;
        width: 100%;
        margin: 0px 0px 0px 0px;
        padding: 0px 0px 0px 0px;
        line-height: 1.3;
        text-align: justify;
        font-size: 16px;
        display: flex;
        flex-direction: column;
    }
    
    .centerPrompt {
        background: #ffffff;
    }
    
    .theActualPrompt {
        margin: 0 auto;
        max-width: 610px;
        
        line-height: 1.55; 
        background: #ffffff; 
        padding-bottom: 8px; 
        padding-left: 8px; 
        padding-right: 8px; 
        border-top: 1px solid black; 
        border-bottom: 1px solid black;
    }
    
    .thePrompt > div {
        display: inline-block;
    }
    
    .redeemWrapper {
        font-size: 10px;
    }    
    
    .buttonWrapper {
        margin: 10px auto 0px auto;
    }
    
    .button {
        width: 305px;
        height: 40px;
        text-align: center;
        margin: 0px auto;
    }
    
    .buttonPrimary {
        box-shadow: 0px 10px 14px -7px #276873;
        background:linear-gradient(to bottom, #599bb3 5%, #408c99 100%);
        background-color:#599bb3;
        border-radius:8px;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:20px;
        font-weight:bold;
        padding:13px 28px;
        text-decoration:none;
        text-shadow:0px 1px 0px #3d768a;
    }
    
    .buttonPbWallet {
        box-shadow: 0px 10px 14px -7px #d0bb81;
        background: linear-gradient(to bottom, #f7e4b3 5%, #faf3dd 100%);
        background-color: #faf3dd;
        border-radius: 8px;
        cursor: pointer;
        color: #e26d5a;
        font-family: Arial;
        font-size: 20px;
        font-weight: bold;
        padding: 13px 28px;
        text-decoration: none;
        text-shadow:0px 1px 0px white;
    }
    
    
    
    .buttonPbWallet:hover {
        background: linear-gradient(to bottom, #faf3dd 5%, #f7e4b3 100%);
        background-color:#408c99;
    }
    .buttonPbWallet:active {
        position:relative;
        top:1px;
    }
    
    
    .after-click {
        disabled: true;
    }
    
    .buttonPrimary:hover {
        background:linear-gradient(to bottom, #408c99 5%, #599bb3 100%);
        background-color:#408c99;
    }
    .buttonPrimary:active {
        position:relative;
        top:1px;
    }
    
    .buttonSecondary {
        border:1px solid #dcdcdc;
        cursor:pointer;
        color:#666666;
        font-family:Arial;
        font-size:15px;
        font-weight:bold;
        padding:12px 0px;
        text-decoration:none;
        text-shadow:0px 1px 0px #ffffff;
    }
    
    .buttonSecondary:hover {
        //background:linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
        //background-color:#f6f6f6;
    }
    .buttonSecondary:active {
        position:relative;
        top:1px;
    }
    
    .skipPurchase {
        border: 1px solid black;
    }
    
    .skipPurchase.skipPurchaseCountdown {
        pointer-events: none;
        color: lightgray;
    }
    
    .redeemInputWrapper {
        width: 200px;
        margin: 0 auto;
    }
    .redeemInputWrapper input {
        width: 200px;
    }
    
    .hidden {
        display: none;
    }
    
    .lastLine {
        border-bottom: 1px solid black;
        height: 16px;
        width: 100%;
    }
    
    
    #pbRedeemError {
        color: red
    }
    `;
    
        const shadow = wrapper.attachShadow({ mode: 'open' });    
        shadow.appendChild(shadowStyle);
    
        // const stripeSdkScript = document.createElement('script');
        // stripeSdkScript.src = 'https://js.stripe.com/v3/';
        // shadow.appendChild(stripeSdkScript);
    
        const stripeHandleFormScript = document.createElement('script');
        const isStripeTest = !!document.getElementById('paperbiteSimulationScript') || window.localStorage.getItem('pbForceStripeTest') === 'true';
        stripeHandleFormScript.innerHTML = `
            
        window['paybricksStripePromise'] = new Promise(resolve => {
            let interval = setInterval(() => {
                try {
                    if (Stripe) {
                        clearInterval(interval);
                        const stripe = Stripe('${isStripeTest ? 'pk_test_51HZsZJCUy8JCtzDgbTyO3Xe166qrBrVTY8pUzX5EpKJVPkCkRnWblkWp5JmO8VP78lFyWGqDciQ0h4U506Yjxyfm00T4W6wVNS' : 'pk_live_51HZsZJCUy8JCtzDgjCTL68nsKJFa3dg8wOMQDh0CRQa17m7HbXoV4J3P3AUb0psHYizVzISvABnVmXN8NT0OaWNP00pkv9wayD'}');
                        resolve(stripe);
                    }
                } catch(e) {
                    // Undefined Stripe
                }
            }, 500);
        });
    
    
        `;    
        shadow.appendChild(stripeHandleFormScript);
        
    
        if (purchase.skipWait >= 0) {
            const skipScript = document.createElement('script');
            skipScript.type = 'text/javascript';
            skipScript.id = `pbScript-${pbUuid}`;
            skipScript.textContent = `
            (function(){
                // debugger;
                const pbWrapper = document.getElementById('pbWrapper-${pbUuid}');
                const shadow = pbWrapper.shadowRoot;
                const thePrompt = shadow.getElementById('thePrompt-${pbUuid}');     
                const skipPurchaseDiv = thePrompt.querySelector('.skipPurchase');
    
                skipPurchaseDiv.addEventListener('pointerup', () => {
                    window['pbShowContent-${pbUuid}'](true);
                });
    
                let secondsRemaining = ${purchase.skipWait};
                const countdownIntervalCb = () => {
                    secondsRemaining--;
                    skipPurchaseDiv.innerHTML = 'Skip payment (please wait ' + secondsRemaining + ' seconds)';
    
                    if (secondsRemaining <= 0) {
                        skipPurchaseDiv.innerHTML = 'I do not wish to support';
                        skipPurchaseDiv.classList.remove('skipPurchaseCountdown');
                        clearInterval(countdownInterval);
                        observer.disconnect();
                    }
                };
                let countdownInterval;
                const observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting && !countdownInterval) {
                        countdownInterval = setInterval(countdownIntervalCb, 1000);
                    }
    
                    if (!entry.isIntersecting && countdownInterval) {
                        clearInterval(countdownInterval);
                        countdownInterval = null;
                    }
                    
                }, {threshold: 0.5});
                observer.observe(thePrompt);            
            })();
        `;
    
            thePrompt.appendChild(skipScript);
        }
    
        window[`pbShowContent-${pbUuid}`] = (isSkip) => {
            el.removeChild(wrapper);
            clearInterval(el.pbIntervalHandle);
            el.style.removeProperty('height');
            el.style.removeProperty('overflow-y');
    
            if (isSkip) {
                const urlParams = new URLSearchParams({
                    globalUuid: getPaperBiteConfig()?.globalUuid,
                    pageUuid: pbUuid,
                    url: document.location.href.split('?')[0],
                    pageHitClientId
                }).toString();
        
                fetch(`https://api.paybricks.io/v1/wp-skip?${urlParams}`, {method: 'GET'})
                    .then(() => {})
                    .catch(() => {});
        
            }
    
        };
    
        // const stripeScript = document.createElement('script');
        // stripeScript.onload = () => {
        //     fetch(`https://api.paybricks.io/v1/wp-stripe-get-client-secret?currency=${currency}&amount=${(purchase.price * 100)}`)
        //         .then(r => r.json())
        //         .then(r => {
        //             // See your keys here: https://dashboard.stripe.com/apikeys
        //             const stripe = Stripe('pk_test_51HZsZJCUy8JCtzDgbTyO3Xe166qrBrVTY8pUzX5EpKJVPkCkRnWblkWp5JmO8VP78lFyWGqDciQ0h4U506Yjxyfm00T4W6wVNS');
    
        //             const elements = stripe.elements({
        //                 clientSecret: r.clientSecret
        //             });
    
        //             //const paymentElement = elements.create('payment');
        //             //paymentElement.mount(thePrompt.querySelector('#stripeContainer'));
        //         })
    
    
        // };
        // stripeScript.src = 'https://js.stripe.com/v3/';
        // thePrompt.appendChild(stripeScript);
    
        shadow.appendChild(thePrompt);
    
        const redeemInputField = thePrompt.querySelector('#pbRedeemInput');
        redeemInputField?.addEventListener('input', e => {
            const code = e.target.value.replaceAll('-', '').substring(0, 10).toUpperCase();
    
            if (code.length === 10) {
                e.target.disabled = true;
                e.target.value = 'Please wait...';
                const urlParams = new URLSearchParams({
                    globalUuid: getPaperBiteConfig()?.globalUuid,
                    pageUuid: pbUuid,
                    url: document.location.href.split('?')[0],
                    code
                }).toString();
    
                fetch(`https://api.paybricks.io/v1/wp-redeem-code?${urlParams}`)
                    .then(r => {
                        if (r.status >= 400 && r.status <= 499) {
                            redeemInputField.value = "";
                            redeemInputField.disabled = false;
                            thePrompt.querySelector('#pbRedeemError').classList.remove('hidden');
                        } else {
                            window[`pbShowContent-${pbUuid}`](false);
                        }
                    })
            }
        });
    
        thePrompt.querySelector('#buyPaybricksCredit')?.addEventListener('pointerup', () => {
            goToApp();
        });
    
        thePrompt.querySelector('#usePaybricksCredit')?.addEventListener('pointerup', () => {
            const currentAddress = document.location.href.split('?')[0];
            const currentAddressSafe = encodeURIComponent(currentAddress);
            const urlParams = JSON.stringify({
                globalUuid: getPaperBiteConfig()?.globalUuid,
                purchaseUuid: pbUuid,
                url: document.location.href.split('?')[0],
                // customerEmail: 'something@something.com',
                returnUrl: currentAddress,
                usePaybricksCredit: true,
                // priceBrickoshi: purchase.priceBrickoshi,
                tempSession: getPaperBiteConfig()?.globalUuid,
                isStripeTest: !!document.getElementById('paperbiteSimulationScript') || window.localStorage.getItem('pbForceStripeTest') === 'true'
            });
            
            document.location.href = `https://app.paybricks.io/?redirectPayload=${btoa(urlParams)}`;
        });
    
        const consentToPurchaseDiv = thePrompt.querySelector('#consentToPurchaseDiv');
        consentToPurchaseDiv?.addEventListener('pointerup', async () => {
            consentToPurchaseDiv.classList.add('hidden');
            thePrompt.querySelector('#pbWalletHtmlWrapper').classList.remove('hidden');
        });
    
    
        const singlePurchaseButton = thePrompt.querySelector('#singlePurchaseButton');
        let alreadyStripeMounted = false;
        singlePurchaseButton?.addEventListener('pointerup', async () => {
            // thePrompt.querySelector('#stripeContainer').classList.remove('hidden');
    
            if (singlePurchaseButton.classList.contains('after-click')) {
                return;
            }
    
            const currentAddress = document.location.href.split('?')[0];
            const currentAddressSafe = encodeURIComponent(currentAddress);
    
            // const forceStripeTest = !!document.getElementById('paybricksTest')?.attributes.getNamedItem('data-pb-force-stripe-test')?.value;
            const forceStripeTest = (window.localStorage.getItem('pbForceStripeTest') === 'true') ||
                !!document.getElementById('paperbiteSimulationScript') ||
                document.location.href.split('?')[1]?.includes('pbForceTest=true');
    
            const urlParams = new URLSearchParams({
                globalUuid: getPaperBiteConfig()?.globalUuid,
                purchaseUuid: pbUuid,
                url: document.location.href.split('?')[0],
                // customerEmail: 'something@something.com',
                returnUrl: currentAddressSafe,
                amount: purchase.price,
                isStripeTest: forceStripeTest,
                cb: new Date().getTime()
            }).toString();    
    
            singlePurchaseButton.classList.add('after-click');
            singlePurchaseButton.innerHTML = 'Please wait...';        
    
            if (forceStripeTest) {
                alert('(Simulation mode) Use the following credit card number to simulate a purchase: 4242 4242 4242 4242. Enter any value for all the other fields.');
            }
    
            document.location.href = `https://api.paybricks.io/v1/wp-stripe-redirect?${urlParams}`;
            return;
    
            document.querySelector(".__paybricksStripeOverlay").classList.toggle("__paybricksStripeOverlay--open");
            document.body.classList.toggle("__paybricksOverlayOpen");
            document.querySelector("#__paybricksStripeOverlay").setAttribute("aria-expanded", "true");
    
            document.getElementById('__paybricksClose').addEventListener('pointerup', () => {
                document.querySelector(".__paybricksStripeOverlay").classList.remove("__paybricksStripeOverlay--open");
                document.body.classList.remove("__paybricksOverlayOpen");
                document.querySelector("#__paybricksStripeOverlay").setAttribute("aria-expanded", "false");
                document.getElementById('__paybricksCompletePurchase').classList.add('__paybricksHidden');
                document.querySelector('#__paybricksStripeOverlayPleaseWait').classList.remove('__paybricksHidden');
            });
    
    
            const stripeLib = await window['paybricksStripePromise'];        
    
            
            fetch(`https://api.paybricks.io/v1/wp-stripe-get-client-secret?${urlParams}`, {method: 'get'})
                .then(r => r.json())
                .then(({clientSecret}) => {
                    document.querySelector('#__paybricksStripeOverlayPleaseWait').classList.toggle('__paybricksHidden');
                    document.getElementById('__paybricksCompletePurchase').classList.toggle('__paybricksHidden');
    
                    if (alreadyStripeMounted) {
                        return;
                    }
    
                    alreadyStripeMounted = true;
    
                    const form = document.querySelector('#__paybricks-payment-form');
    
                    // debugger;
                    // document.getElementById('__paybricksStripeOverlay').style.visibility = 'visible';
                    // thePrompt.getElementById('nav-closer').focus();
                    const elements = stripeLib.elements({
                        clientSecret
                    });
                    const paymentElement = elements.create('payment');
                    paymentElement.mount(document.querySelector('#__paybricks-payment-element'));
        
                    document.getElementById('__paybricksCompletePurchase').addEventListener('pointerup', async () => {
                        document.getElementById('__paybricksCompletePurchase').classList.add('__paybricksAfterClick');
                        document.getElementById('__paybricksCompletePurchase').innerHTML = 'Please wait...';                    
                
                        const stripeRes = await stripeLib.confirmPayment({
                            elements,
                            redirect: 'if_required'
                        });
    
                        debugger;
    
                        document.getElementById('__paybricksCompletePurchase').classList.remove('__paybricksAfterClick');
                
                        if (stripeRes.error) {
                            // This point will only be reached if there is an immediate error when
                            // confirming the payment. Show error to your customer (for example, payment
                            // details incomplete)
                            const messageContainer = document.querySelector('#__paybricks-error-message');
                            messageContainer.textContent = stripeRes.error.message;
                        } else {
                            console.log('stripe ok');
                            document.querySelector(".__paybricksStripeOverlay").classList.toggle("__paybricksStripeOverlay--open");
                            document.body.classList.toggle("__paybricksOverlayOpen");
                            document.querySelector("#__paybricksStripeOverlay").setAttribute("aria-expanded", "false");
                            window[`pbShowContent-${pbUuid}`]();
                        }
                    });    
            
                });
        });
    
        if (thePrompt.querySelector('#usePaybricksWalletIframe')) {
            const iframeEl = document.createElement('iframe');
            iframeEl.setAttribute('allowTransparency', 'true');
            iframeEl.setAttribute('border', '0');
            iframeEl.setAttribute('scrolling', 'no');
    
            if((('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))) {
                iframeEl.setAttribute('style', 'border:0px;overflow:hidden;width:100%;height:100%;max-height:65px');
            } else {
                iframeEl.setAttribute('width', `100%`);
                iframeEl.setAttribute('max-height', `65px`);
                iframeEl.setAttribute('style', 'border:0px;overflow:hidden;max-height:65px');    
            }
    
            const currentAddress = document.location.href.split('?')[0];
            const currentAddressSafe = encodeURIComponent(currentAddress);
            
            const tempMessageSecret = uuidv4();
    
            const urlParamsObj = {    
                tempMessageSecret, 
                globalUuid: getPaperBiteConfig()?.globalUuid,       
                pbUuid,
                price: purchase.price,
                useBricks: true,
                clientId,          
                wait: purchase.skipWait,
                // walletDiscount: purchase?.walletDiscount ?? 0,
                url: document.location.href.split('?')[0]
            };
    
            if (!!urlQueryParams.simulatePayBricks || injectedSimulation) {
                urlParamsObj.simulatePayBricks = 'true';
            }
    
            const urlParams = new URLSearchParams(urlParamsObj).toString();
    
            iframeEl.setAttribute(
                'src', 
                (window.localStorage.getItem('dbgIframeUrlPrefix') ?? 'https://app.paybricks.io/wp') + `/wallet-iframe.html?${urlParams}`
            );
            iframeEl.setAttribute('sandbox', 'allow-storage-access-by-user-activation allow-scripts allow-same-origin');
    
            thePrompt.querySelector('#usePaybricksWalletIframe').appendChild(iframeEl);
    
            window.onmessage = e => {
                if (e.origin === 'https://app.paybricks.io' || e.origin === 'http://localhost:8080') {
                    const data = JSON.parse(e.data);
    
                    if (data.secret === tempMessageSecret) {
                        if (data.paymentComplete || data.alreadyPurchased) {
                            window[`pbShowContent-${pbUuid}`]();
                        } else if (data.goToApp) {
                            goToApp(e.origin === 'http://localhost:8080');
                        }
                    }
                }
            }
        }
        
    
        let intervalHandle;
    
        const updatePosition = () => {
            if (document.body.contains(el)) {
                thePrompt.style.top = (el.clientHeight - thePrompt.clientHeight) + 'px';
            } else {
                console.warn('Element no longer child of document body');
                clearInterval(intervalHandle);
            }
        };
    
        intervalHandle = setInterval(updatePosition, 100);
    };
    
    const getContentStartMarker = entryContent => {
        return entryContent.querySelector('section[data-paybricks-start]');
    };
    
    const limitElementToStartMarker = el => {
        let intervalHandle;
    
        const updateHeight = () => {
            if (document.body.contains(el)) {
    
                const startMarker = getContentStartMarker(el);
                const sibling = startMarker?.previousElementSibling ?? startMarker?.nextElementSibling;
    
                const pbWrapper = document.getElementById(`pbWrapper-${pbUuid}`);
                const shadow = pbWrapper.shadowRoot;
                const thePrompt = shadow.getElementById(`thePrompt-${pbUuid}`);  
                
                // if (thePrompt && sibling) {
                //     debugger;
                // }
                // thePrompt.style.top = (el.clientHeight - thePrompt.clientHeight) + 'px';
    
                // el.style.height = Math.floor(el.scrollHeight * percentage).toString() + 'px';
                el.style.height = (sibling.offsetTop + thePrompt.clientHeight) + 'px';
            } else {
                console.warn('Element no longer child of document body');
                clearInterval(intervalHandle);
            }
        };
    
        intervalHandle = setInterval(updateHeight, 100);
    
        el.pbIntervalHandle = intervalHandle;
    
        el.style['overflow-y'] = 'hidden';
    
    }
    
    
    const applyPurchaseMonetization = ({ currency, purchase, pageHitClientId }) => {
        console.log(currency, purchase);
    
        const entryContent = getEntryContent();
    
        if (getContentStartMarker(entryContent)) {
            limitElementToStartMarker(entryContent);
        } else {
            limitElementToPercentage(entryContent, purchase.position);
        }
    
        showPurchasePrompt(entryContent, purchase, currency, pageHitClientId);
    
    }
    
    const alreadyPurchased = () => {
    
        const item = getLocalStorageItem();
    
        return (item?.status === 'redeem' || item?.status === 'purchased') && !item?.forceBuy;
    };
    
    const applyMonetization = (monetizationConfig) => {
    
        if (monetizationConfig.type === 'donation') {
            applyDonationMonetization(monetizationConfig);
        } else if (monetizationConfig.type === 'purchase') {
    
            if (!alreadyPurchased()) {
                applyPurchaseMonetization(monetizationConfig);
            }
        }
    }
    
    const isEntryContentReady = () => {
        // const divs = document.getElementsByClassName('entry-content');
        // return divs.length === 1;
        try {
            return !!getEntryContent();
        } catch(e) {
            return false;
        }    
    }
    
    const awaitEntryContentReady = async () => {
    
        if (isEntryContentReady()) {
            return;
        } else {
            await new Promise(r => {
                const observer = new (window.MutationObserver || window.WebKitMutationObserver)(() => {
                    if (isEntryContentReady()) {
                        observer.disconnect();
                        r();
                    }
                });
            });
        }
    }
    
    const initStripeModalDialog = () => {
        // Modal library
        const modalDialogScript = document.createElement('script');
        modalDialogScript.onload = () => {
            const modalDialogDiv = document.createElement('div');
            modalDialogDiv.innerHTML = `
        <!-- [1] -->
        <div id="pbStripeModal-${pbUuid}" aria-hidden="true">
        
            <!-- [2] -->
            <div tabindex="-1" data-micromodal-close>
        
            <!-- [3] -->
            <div role="dialog" aria-modal="true" aria-labelledby="modal-1-title" >
        
        
                <header>
                <h2 id="modal-1-title">
                    Modal Title
                </h2>
        
                <!-- [4] -->
                <button aria-label="Close modal" data-micromodal-close></button>
                </header>
        
                <div id="modal-1-content">
                Modal Content
                </div>
        
            </div>
            </div>
        </div>
        `;
            document.body.appendChild(modalDialogDiv);
            const innerDiv = modalDialogDiv.querySelector(`#pbStripeModal-${pbUuid}`);
            setTimeout(() => {
                debugger;
                // innerDiv.attributes.removeNamedItem('aria-hidden');
                MicroModal.show(`pbStripeModal-${pbUuid}`);
            }, 10000);
    
        };
        modalDialogScript.src = 'https://paperbite-www-static.s3.amazonaws.com/lib/micromodal.min.js';
        document.body.appendChild(modalDialogScript);
    
    };
    
    const getExecutionParametersFromScriptTag = () => {
        const scriptTag = document.getElementById('paperbiteSimulationScript');
        const scriptParams = scriptTag?.src?.split('?')[1];
    
        if (scriptTag) {
            try {
                const scriptParamsObj = JSON.parse('{"' + decodeURI(scriptParams).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
                return scriptParamsObj;
            } catch(e) {
    
            }
        }
    
        return null;
    };
    
    const handleSimulationTasks = () => {
    
        const scriptTag = document.getElementById('paperbiteSimulationScript');
        // const scriptParams = scriptTag?.src?.split('?')[1];
    
        let skipSimulation = false;
    
        // happens when coming back from purchase after simulation hide 
        if (window.localStorage.getItem('pbTempSingleSimulationSkip') === 'true') {
            window.localStorage.removeItem('pbTempSingleSimulationSkip');
            skipSimulation = true;
        }
    
        if (scriptTag && !skipSimulation) {
            // const scriptParamsObj = JSON.parse('{"' + decodeURI(scriptParams).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    
            const blinkStyleEl = document.createElement('style');
            blinkStyleEl.innerHTML = `
            .paperbiteBlink {
                animation: paperbiteBlinker 5s linear infinite;
                font-family: Arial
              }
              
              @keyframes paperbiteBlinker {
                50% {
                  opacity: 0.5;
                }
              }        
            `;        
    
            document.head.appendChild(blinkStyleEl);
    
            const simulationAlertDiv = document.createElement('div');
            simulationAlertDiv.classList.add('paperbiteBlink');
            simulationAlertDiv.style.position = 'fixed';
            simulationAlertDiv.style.top = '0em';
            simulationAlertDiv.style.left = '0em';
            simulationAlertDiv.style.width = '100%';
            simulationAlertDiv.style.height = '80px';
            simulationAlertDiv.style.cursor = 'pointer';
            simulationAlertDiv.style.zIndex = 999999;
            simulationAlertDiv.innerHTML = `
                <div style="font-size: 28px">PayBricks Simulation</div>
                <div style="font-size: 16px">Tap or click here to reset simulation</div>
            `;
            simulationAlertDiv.style.background = '#e26d5a';
            simulationAlertDiv.style.textAlign = 'center';
            let hideSimulationDivTimeout;
            const onSimulationDivPointerUp = () => {
                
                if (hideSimulationDivTimeout) {
                    clearTimeout(hideSimulationDivTimeout);
                }
    
                setLocalStorageItem({});
                window.localStorage.removeItem('paperbiteConfig');
                alert('Simulation reset successfully, page will reload now');
                document.location.reload();        
            };
            simulationAlertDiv.addEventListener('pointerup', onSimulationDivPointerUp);
            
            simulationAlertDiv.addEventListener('pointerdown', () => {
                hideSimulationDivTimeout = setTimeout(() => {
                    document.body.removeChild(simulationAlertDiv);    
                    window.localStorage.setItem('pbTempSingleSimulationSkip', 'true');
                }, 3000);
            });        
    
            // simulationAlertDiv.style.fontSize = '36px';
            document.body.appendChild(simulationAlertDiv);
    
            const urlParams = new Proxy(new URLSearchParams(scriptTag.src), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            
            // &simulationMonetization=eyJ0eXBlIjoicHVyY2hhc2UiLCJjdXJyZW5jeSI6IlVTRCIsInB1cmNoYXNlIjp7InBvc2l0aW9uIjowLjYsInByaWNlIjoxLCJza2lwV2FpdCI6MTAsInVwc2FsZSI6W3sidHlwZSI6ImFtb3VudCIsImFtb3VudCI6MywicHJpY2UiOjJ9LHsidHlwZSI6InN1YnNjcmlwdGlvbiIsInRpbWUiOjEyLCJwcmljZSI6NTB9XX19
            // return urlParams?.simulationMonetization ? 
            //     JSON.parse(window.atob(urlParams.simulationMonetization)) : {};    
    
            return true;
        }
    
        return false;
    
    };
    
    const onContentLoaded = async (monetizationResponse) => {
    
        // let monetizationResponse;
    
        // document.removeEventListener('DOMContentLoaded', onContentLoaded);
    
        let proceed = true;
            
        const { globalUuid } = getPaperBiteConfig();
    
        if (!document.body) {
            await new Promise(r => {
                const bodyInterval = setInterval(() => {
                    if (document.body) {
                        clearInterval(bodyInterval);
                        r();
                    }
                }, 500);
            });
        }
    
        const overrideParams = {};
    
        if (urlQueryParams.overrideProbability) {
            overrideParams.overrideProbability = urlQueryParams.overrideProbability;
        }
    
        if (urlQueryParams.overrideSkipWait) {
            overrideParams.overrideSkipWait = urlQueryParams.overrideSkipWait;
        }
    
        const urlParams = new URLSearchParams({
            globalUuid,
            pageUuid: pbUuid,
            url: document.location.href.split('?')[0],
            siteUuid: getExecutionParametersFromScriptTag()?.siteUuid,
            isSimulation: handleSimulationTasks() ?? undefined,
            globalVisitorId: globalPbVisitorInfo?.globalVisitorId,
            clientId,
            ...overrideParams
        }).toString();
    
    
        // monetizationResponse = await fetch(`https://api.paybricks.io/v1/wp-get-monetization?${urlParams}`)
        //     .then(r => {
        //         proceed = r.status === 200;
        //         return r.json();
        //     })
        //     .catch((e) => {
        //         // on any error to api, show content
        //         proceed = false;
        //         // alert(JSON.stringify(e));
        //         return {};
        //     });
    
        // proceed = monetizationResponse?.type === 'purchase' || monetizationResponse?.type === 'donation';
    
        // if (getOverridesConfig()?.monetizationResponse) {
        //     proceed = true;
        //     monetizationResponse = getOverridesConfig()?.monetizationResponse;
        // }
    
        if (!proceed) {
            return;
        }
    
        await awaitEntryContentReady();
    
        if (isEntryContentReady()) {
            applyMonetization(monetizationResponse);
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    
        // initStripeModalDialog();
    
    };
    
    const debounce = (fn, t) => {
        let timeout = null;
    
        return (...args) => {
            if (timeout) {
                clearInterval(timeout);
            }
    
            timeout = setTimeout(() => {
                timeout = null;
                fn(...args);
            }, t);
        }
    };
    
    // document.addEventListener('DOMContentLoaded', onContentLoaded);
    
    const addGlobalStyle = () => {
        const globalStyle = document.createElement('style');
        globalStyle.innerHTML = `
    body.__paybricksOverlayOpen {
        overflow: hidden;
    }
    
    .__paybricksOverlayOpen .paybricksMenuOverlay {
        opacity: 1;
        visiblity: visible;
    }    
    
    .__paybricksStripeContainer {
        margin: 0 auto;
        max-width: 350px;
        padding-top: 110px;
    }
    
    .__paybricksStripeOverlay {
        visibility: hidden;
        position: fixed;
        z-index: 9999999;
        width: 100vw;
        height: 100vh;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        opacity: 0;
        background-color: #ffffff;
        color: #000000;
        overflow-x: hidden;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        transition: opacity 0.5s, visibility 0.5s;
    }
    
    .__paybricksStripeOverlay--open {
        opacity: 1;
        visibility: visible;
    }
    
    #__paybricks-payment-element {
        
    }
    
    .__paybricksHidden {
        display: none;
    }
    
    .__paybricksButton {
        width: 305px;
        height: 48px;
        text-align: center;
        padding:13px 28px 13px 28px;
        margin: 15px auto;
    }
    
    .__paybricksButtonPrimary {
        box-shadow: 0px 10px 14px -7px #276873;
        background:linear-gradient(to bottom, #599bb3 5%, #408c99 100%);
        background-color:#599bb3;
        border-radius:8px;
        cursor:pointer;
        color:#ffffff;
        font-family:Arial;
        font-size:20px;
        font-weight:bold;    
        text-decoration:none;
        text-shadow:0px 1px 0px #3d768a;
    }
    
    .__paybricksAfterClick {
        disabled: true;
    }
    
    .__paybricksButtonPrimary:hover {
        background:linear-gradient(to bottom, #408c99 5%, #599bb3 100%);
        background-color:#408c99;
    }
    .__paybricksButtonPrimary:active {
        position:relative;
        top:1px;
    }
    
    #__paybricksClose {
        position: absolute;
        right: 32px;
        top: 32px;
        width: 32px;
        height: 32px;
        opacity: 0.3;
        cursor: pointer;
      }
      #__paybricksClose:hover {
        opacity: 1;
      }
      #__paybricksClose:before, #__paybricksClose:after {
        position: absolute;
        left: 15px;
        content: ' ';
        height: 33px;
        width: 2px;
        background-color: #333;
      }
      #__paybricksClose:before {
        transform: rotate(45deg);
      }
      #__paybricksClose:after {
        transform: rotate(-45deg);
      }
        `;
    
        document.head.appendChild(globalStyle);
    }
    
    const go = async () => {
    
        const currentFullUrl = document.location.href;
    
        const urlParams = new URLSearchParams({
            url: currentFullUrl,
            globalUuid: getPaperBiteConfig()?.globalUuid,
            userAgent: navigator.userAgent,
            clientId
        }).toString();
    
        let executionParams = await fetch(`https://api.paybricks.io/v1/wp-get-execution-params?${urlParams}`, {method: 'GET'})
            .then(r => r.json())
            .catch(() => ({
                proceed: false
            }));
    
        if (!!urlQueryParams.simulatePayBricks || injectedSimulation) {
            executionParams = {
                proceed: true,
                price: 1,
                wait: 10
            };
        }
    
        if (getOverridesConfig()?.getExecutionParamsResponse) {
            alert('PayBricks testing mode. Scroll down to see PayBricks in action');
            console.log('overriding execution params');
            executionParams = getOverridesConfig()?.getExecutionParamsResponse;
        }
    
        if (executionParams.proceed) {
    
            await awaitEntryContentReady();
    
            addGlobalStyle();
    
            const saleMessage = executionParams.price > 0 ? 
                'Please support us by purchasing the rest of this post' : 
                'Please support us by creating a free PayBricks account';
    
            onContentLoaded({type: 'purchase', purchase: {
                skipWait: executionParams.wait, 
                price: executionParams.price,
                disableSinglePurchase: true,
                position: 0.5,
                saleMessage: saleMessage + (executionParams.wait === 999 ? '.' : ', or skip using the button below.')
            }});
    
        }
    
    }
    
    if (document.readyState == 'loading') {
        // still loading, wait for the event
        document.addEventListener('DOMContentLoaded', () => {
            go().then(() => {});
        });
    } else {
        // DOM is ready!
        go().then(() => {});
    }
    
    
    })();
    
    