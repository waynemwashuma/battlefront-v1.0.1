function createElement(tag, options = {}) {
    e = document.createElement(tag);
    if (options.id) e.id = options.id;
    if (options.class) {
        e.className = options.class;
    }
    return e


}
function writeParagraph(el, text) {
    typeof text == "string" ? el.append(document.createTextNode(text)) : el.append(text);
}
alert = (function () {
    let attributes = [{
        id: "alert-wrapper"
    },
    {
        id: "alert-blank",
    },
    {
        id: "alert-container",
    },
    {
        id: "alert-header"
    },
    {
        id: "alert-body"
    },
    {
        id: "alert-footer"

    }, { id: "alert-butt" }], divs = [];
    for (let i = 0; i < attributes.length; i++) {
        divs.push(createElement("div", attributes[i]));
    };
    let butt = createElement("button", { id: "alert-ok-butt" });
    butt.append(document.createTextNode("ok\!"))
    //divs[5].append(butt);
    divs[4].append(divs[5])
    for (let i = 3; i < divs.length - 1; i++) {
        divs[2].append(divs[i]);
    }
    butt.onclick = function () {
        divs[0].remove()
    }
    divs[0].append(divs[1], divs[2]);
    return function (header = "Alert\!", body = "The page says\"Hello World\"") {
        divs[0].remove();
        for (let i = 3; i < divs.length; i++) {
            divs[i].innerHTML = "";
        }
        document.body.append(divs[0])
        writeParagraph(divs[3], header);
        writeParagraph(divs[4], body);
        divs[5].append(butt);
    }
})();
var gameToolbar = (function () {
    let scaleUpButton = (function () {
        let divs = [];
        let divsid = ["base", "vert", "hori", "overlay"];
        for (let i = 0; i < divsid.length; i++) {
            divs.push(createElement("div", { id: "scale\-up\-" + divsid[i] }))
        }
        divs[0].append(divs[1], divs[2])
        return divs[0]
    })();

    let scaleDownButton = (function () {
        let butt = [];
        let buttid = ["base", "minus"];
        for (let i = 0; i < buttid.length; i++) {
            butt.push(createElement("div", { id: "scale\-down\-" + buttid[i] }))
        }
        butt[0].append(butt[1]);
        return butt[0]
    })();
    let fullscreenButton = (function () {
        let butt = [];
        let buttid = ["base", "main", "hori", "vert", "overlay"]
        for (let i = 0; i < buttid.length; i++) {
            if (i == buttid.length - 1) {
                butt.push(createElement("button", { id: "full\-butt\-" + buttid[i] }))
            }
            butt.push(createElement("div", { id: "full\-butt\-" + buttid[i] }))
        }
        delete buttid;
        butt[0].append(butt[1]);
        butt[1].append(butt[2], butt[3], butt[4]);
        butt[0].onclick = function () {
            if (!document.body.requestFullscreen()) {
                console.error("failed to toggle fullscreen,try in Chrome");
                alert("Fullscreen error!", "Please try fullscreen in Chrome,this browser is not supported");
            }
        }
        return butt[0]
    })();
    let divs = [];
    let divsid = ["base", "scaleUp", "scaleDown", "fullscreen"];
    for (let i = 0; i < divsid.length; i++) {
        divs.push(createElement("div", { id: "tool\-" + divsid[i] }))
    }
    for (let i = 1; i < divs.length; i++) {
        divs[0].append(divs[i])
    }
    document.body.append(divs[0]);
    divs[1].append(scaleUpButton);
    divs[2].append(scaleDownButton);
    divs[3].append(fullscreenButton);
})();
function writeParagraph(e, text) {
    let txt = text || '';
    let p = document.createElement('p');
    p.innerText = text;
    e.append(p);
    return e
}
let loadScreen = (function () {

    let divs = [
        createElement('div', { id: 'load-blank' }),
        createElement('div', { id: 'load-main' }),
        createElement('div', { id: 'load-header' }),
        createElement('div', { id: 'load-body' }),
        createElement('div', { id: 'load-footer' }),
        createElement('div', { id: 'load-bar-base' }),
        createElement('div', { id: 'load-bar-static' }),
        createElement('div', { id: 'load-bar-move' })
    ]
    divs[5].append(divs[6])
    divs[6].append(divs[7])
    divs[3].append(divs[5])
    divs[1].append(divs[2], divs[3], divs[4])
    divs[2].append(document.createTextNode('battlefront'.toUpperCase()))
    //dom manipulation of load-bar-move
    return {
        open: function () {
            document.body.append(divs[0]);
            document.body.append(divs[1])
        },
        remove: function () {
            divs[0].remove()
            divs[1].remove()
        }
    }
})();

let mainMenu = (function () {
    let communityContent = {
        base: createElement('div', { id: 'community-base' }),
        main: createElement('div', { id: 'community-main' }),
        table: createElement('table', { id: 'community-table' }),
        tableHeader: createElement('thead', { id: 'community-table-header' }),
        footer: createElement('div', { id: 'community-footer' }),
        headerName: createElement('th', { id: 'community-header-name' }),
        headerAlli: createElement('th', { id: 'community-header-alli' }),
        headerBases: createElement('th', { id: 'community-header-bases' }),
        prev: createElement('div', { id: 'community-footer-previous', class: 'community-raw' }),
        first: createElement('div', { id: 'community-footer-first', class: 'community-raw' }),
        second: createElement('div', { id: 'community-footer-second', class: 'community-raw' }),
        third: createElement('div', { id: 'community-footer-third', class: 'community-raw' }),
        next: createElement('div', { id: 'community-footer-next', class: 'community-raw' }),
        footerWrapper: createElement('div', { id: 'community-footer-wrapper' })
    },
        alliContent = {
            base: createElement('div', { id: 'alli-base' }),
            main: createElement('div', { id: 'alli-main' }),
            header: createElement('div', { id: 'alli-header' }),
            body: createElement('div', { id: 'alli-body' }),
            footer: createElement('div', { id: 'alli-footer' }),
            bodyTable: createElement('table', { id: 'alli-body-table' }),
            bodyTableHead: createElement('tr', { id: 'alli-body-table-head' }),
            bodyTableName: createElement('td', { id: 'alli-body-table-head-name' }),
            bodyTableMembers: createElement('td', { id: 'alli-body-table-head-memberNo' }),
            bodyTableBases: createElement('td', { id: 'alli-body-table-head-bases' }),
        },
        optionContent = {
            base: createElement('div', { id: 'option-base' }),
            main: createElement('div', { id: 'option-main' }),
            header: createElement('div', { id: 'option-header' }),
            body: createElement('div', { id: 'option-body' }),
            footer: createElement('div', { id: 'option-footer' }),
        },
        helpContent = {
            base: createElement('div', { id: 'help-base' }),
            main: createElement('div', { id: 'help-main' }),
            header: createElement('div', { id: 'help-header' }),
            body: createElement('div', { id: 'help-body' }),
            footer: createElement('div', { id: 'help-footer' })
        };
    //arranges the nodes of community tab//
    communityContent.headerName.append(document.createTextNode('Name'));
    communityContent.headerAlli.append(document.createTextNode('Alliance'));
    communityContent.headerBases.append(document.createTextNode('Bases'));
    communityContent.prev.append(document.createTextNode('previous'));
    communityContent.first.append(document.createTextNode('1'));
    communityContent.second.append(document.createTextNode('2'));
    communityContent.third.append(document.createTextNode('3'));
    communityContent.next.append(document.createTextNode('next'));
    communityContent.base.append(communityContent.main);
    communityContent.table.append(communityContent.tableHeader);
    communityContent.tableHeader.append(communityContent.headerName, communityContent.headerAlli, communityContent.headerBases);
    communityContent.footer.append(communityContent.footerWrapper);
    communityContent.main.append(communityContent.table, communityContent.footer)
    communityContent.footerWrapper.append(communityContent.prev, communityContent.first, communityContent.second, communityContent.third, communityContent.next);
    //document.body.append(communityContent.base);


    //arranges nodes of alliance tab//
    alliContent.base.append(alliContent.main);
    alliContent.main.append(alliContent.header);
    alliContent.main.append(alliContent.body);
    alliContent.main.append(alliContent.footer);
    alliContent.body.append(alliContent.bodyTable)
    alliContent.bodyTable.append(alliContent.bodyTableHead);
    alliContent.bodyTableHead.append(alliContent.bodyTableName)
    alliContent.bodyTableHead.append(alliContent.bodyTableMembers)
    alliContent.bodyTableHead.append(alliContent.bodyTableBases)
    alliContent.bodyTableName.append(document.createTextNode('Name'))
    alliContent.bodyTableMembers.append(document.createTextNode('Members'))
    alliContent.bodyTableBases.append(document.createTextNode('Bases'))
    let createAliiButt = alliContent.bodyTable.appendChild(document.createElement('tr'))
    createAliiButt.setAttribute('id', 'create-alli-butt')
    createAliiButt.append(document.createTextNode('Create alliance.'))
    //arranges nodes of alliance tab//
    helpContent.base.append(helpContent.main);
    helpContent.main.append(helpContent.header);
    helpContent.main.append(helpContent.body);
    helpContent.main.append(helpContent.footer);

    //arranges nodes of alliance tab//
    optionContent.base.append(optionContent.main);
    optionContent.main.append(optionContent.header);
    optionContent.main.append(optionContent.body);
    optionContent.main.append(optionContent.footer);
    let allianceCard = document.createElement('div');
    allianceCard.setAttribute('id', 'alli-card-base');

    ////////alliance card/////
    let memberBase = allianceCard.appendChild(document.createElement('div'));
    memberBase.setAttribute('id', 'alli-card-members-base');
    let members = memberBase.appendChild(document.createElement('table'));
    members.setAttribute('id', 'alli-card-members-table');
    let membersHead = members.appendChild(document.createElement('th'));
    membersHead.setAttribute('id', 'alli-card-members-head');
    let memberName = membersHead.appendChild(document.createElement('td'));
    memberName.setAttribute('id', 'alli-card-members-head-name');
    memberName.append(document.createTextNode('Name'));
    let memberBases = membersHead.appendChild(document.createElement('td'));
    memberBases.setAttribute('id', 'alli-card-members-head-bases');
    memberBases.append(document.createTextNode('Bases'));
    let memberBody = members.appendChild(document.createElement('tbody'));
    memberBody.setAttribute('id', 'alli-card-members-body');
    let info = allianceCard.appendChild(document.createElement('div'));
    info.setAttribute('id', 'alli-card-info');
    let infoName = info.appendChild(document.createElement('div'));
    infoName.setAttribute('id', 'alli-card-info-name');
    let infoDesc = info.appendChild(document.createElement('div'));
    infoDesc.setAttribute('id', 'alli-card-info-desc');
    let infoAdmin = info.appendChild(document.createElement('div'));
    infoAdmin.setAttribute('id', 'alli-card-info-admin');
    let actionDiv = info.appendChild(document.createElement('div'));
    actionDiv.setAttribute('id','alli-card-info-action');
    let joinAllianceButt = actionDiv.appendChild(document.createElement('div'));
    joinAllianceButt.setAttribute('id', 'alli-card-info-join-butt')
    joinAllianceButt.innerHTML = 'Join';
    let disbandAllianceButt = actionDiv.appendChild(document.createElement('div'));
    disbandAllianceButt.setAttribute('id', 'alli-card-info-disband-butt')
    disbandAllianceButt.innerHTML = 'Disband';
    disbandAllianceButt.style.display = 'none';
    //////player card//////---design later----
    let playerBase = document.createElement('div');
    playerBase.setAttribute('id', 'player-card-base');
    let playername = playerBase.appendChild(document.createElement('div'));
    playername.setAttribute('id', 'player-card-name');
    let playerAlliance = playerBase.appendChild(document.createElement('div'));
    playerAlliance.setAttribute('id', 'player-card-alli');
    let playerbases = playerBase.appendChild(document.createElement('div'));
    playerbases.setAttribute('id', 'player-card-bases');


    //create alliance form----done
    let createAlliForm = document.createElement('form');
    createAlliForm.setAttribute('action', '/createAlliance');
    createAlliForm.setAttribute('method', 'post');
    createAlliForm.setAttribute('id', 'create-alli-form')
    let namewrapper = createAlliForm.appendChild(document.createElement('div'));
    namewrapper.setAttribute('id', 'create-alli-wrapper-name');
    let label1 = namewrapper.appendChild(document.createElement('label'));
    label1.append(document.createTextNode('name'))
    let formInput1 = namewrapper.appendChild(document.createElement('input'));
    formInput1.setAttribute('id', 'create-alli-input-name');
    formInput1.setAttribute('type', 'text');
    formInput1.setAttribute('name', 'alliname');
    formInput1.setAttribute('placeholder', 'Name of alliance...');
    let descwrapper = createAlliForm.appendChild(document.createElement('div'));
    descwrapper.setAttribute('id', 'create-alli-wrapper-desc');
    let label2 = descwrapper.appendChild(document.createElement('label'));
    label2.append(document.createTextNode('description'))
    let formInput2 = descwrapper.appendChild(document.createElement('textarea'));
    formInput2.setAttribute('id', 'create-alli-input-desc');
    formInput2.setAttribute('name', 'desc');
    formInput2.setAttribute('placeholder', 'Describe the new alliance...');
    let formInput3 = createAlliForm.appendChild(document.createElement('input'));
    formInput3.setAttribute('id', 'create-alli-input-submit');
    formInput3.setAttribute('type', 'submit');
    let active = false;
    let divs = {
        menuButton: createElement('div', { id: 'main-menu-butt' }),
        base: createElement('div', { id: 'main-menu-base' }),
        main: createElement('div', { id: 'main-menu-main' }),
        header: createElement('div', { id: 'main-menu-header' }),
        body: createElement('div', { id: 'main-menu-body' }),
        footer: createElement('div', { id: 'main-menu-footer' }),
        toolBar: createElement('div', { id: 'main-menu-tool' }),
        alli: createElement('div', { id: 'main-menu-alli', class: 'main-menu-tool-hover' }),
        help: createElement('div', { id: 'main-menu-help', class: 'main-menu-tool-hover' }),
        option: createElement('div', { id: 'main-menu-option', class: 'main-menu-tool-hover' }),
        community: createElement('div', { id: 'main-menu-community', class: 'main-menu-tool-hover' }),
        userInfo: createElement('div', { id: 'main-menu-user' }),
        userName: createElement('div', { id: 'main-menu-user-name' }),
        userAlli: createElement('div', { id: 'main-menu-user-alli' }),
        userLevel: createElement('div', { id: 'main-menu-user-level' }),
        userNamep: createElement('span', { id: 'name' }),
        userAllip: createElement('span', { id: 'alli' }),
        userLevelp: createElement('span', { id: 'level' }),
    };
    divs.userAllip.append(document.createTextNode(user.alliance));
    divs.userNamep.append(document.createTextNode(user.name));
    divs.userLevelp.append(document.createTextNode('20'));
    let labNames = ['name', 'alliance', 'level'];
    //append labels to user card children
    let label = document.createElement('label');
    label.append(document.createTextNode(labNames[0]));
    divs.userName.append(label);
    label = document.createElement('label');
    label.append(document.createTextNode(labNames[1]));
    divs.userAlli.append(label);
    label = document.createElement('label');
    label.append(document.createTextNode(labNames[2]));
    divs.userLevel.append(label);
    divs.userName.append(divs.userNamep);
    divs.userAlli.append(divs.userAllip);
    divs.userLevel.append(divs.userLevelp);
    divs.toolBar.append(divs.option, divs.help, divs.alli, divs.community);
    divs.userInfo.append(divs.userName, divs.userAlli, divs.userLevel)
    divs.header.append(divs.userInfo, divs.toolBar)
    divs.base.append(divs.main);
    divs.main.append(divs.header, divs.body, divs.footer);
    document.querySelector('#top-view').insertBefore(divs.menuButton, document.querySelector('#res-ui'));
    //eventlisteners
    divs.menuButton.appendChild(document.createElement('div')).setAttribute('id', 'menu-center')
    divs.community.onclick = function () {
        if (divs.body.hasChildNodes()) {
            divs.body.children[0].remove()

        }
        divs.body.append(communityContent.base);
    };
    divs.help.onclick = function () {
        if (divs.body.hasChildNodes()) {
            divs.body.children[0].remove()
        }
        divs.body.append(helpContent.base);
    };
    divs.option.onclick = function () {
        if (divs.body.hasChildNodes()) {
            divs.body.children[0].remove()
        }
        divs.body.append(optionContent.base);
    }
    divs.menuButton.onclick = function () {
        if (active) {
            divs.base.remove();
            active = !active;
            return
        }
        document.body.append(divs.base);
        active = !active;
    };
    createAliiButt.onclick = function () {
        if (divs.body.hasChildNodes()) {
            divs.body.children[0].remove()
        }
        divs.body.append(createAlliForm);
    };
    divs.alli.onclick = function () {
        if (divs.body.hasChildNodes()) {
            divs.body.children[0].remove()
        }
        appendAlli();

        divs.body.append(alliContent.base);
    };
    function fetchAllianceData(url, Uname, callback) {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ alliname: Uname }),
            headers: { "Content-Type": "application/json" }
        }).then(data => data.text()).then(callback)
    }
    function update(name, alliance, level) {
        divs.userAllip.innerHTML = alliance.toString();
        divs.userLevelp.innerHTML = level.toString();
        divs.userNamep.innerHTML = name.toString();
    }
    function showAllicard(x) {
        let rrr, sss,le;
        fetchAllianceData('./allianceInfo', x.target.parentElement.children[0].outerText, data => {
            data = JSON.parse(data);
            memberBody.innerHTML = '';
            infoName.innerHTML = data.name;
            infoDesc.innerHTML = data.desciption;
            sss = data.members.split(';');
            sss.pop();
            if (!data.members.includes(user.name)) joinAllianceButt.innerHTML='Join';
            if (data.members.includes(user.name)) joinAllianceButt.innerHTML='Leave';
            for (let i = 0; i < sss.length; i++) {
                sss[i] = sss[i].split('=')
            }
            for (let i = 0; i < sss.length; i++) {
                console.log(sss[i]);
                if (sss[i][0] == 'leader' && sss[i][1] == user.name) disbandAllianceButt.style.display = 'initial';
                rrr = memberBody.appendChild(document.createElement('tr'));
                rrr.innerHTML = `<td class=\'member-name\'>${sss[i][0]} :: ${sss[i][1]}</tr>`
            }
            if (divs.body.hasChildNodes()) {
                divs.body.children[0].remove()

            }
            divs.body.append(allianceCard);
        });
        if (getcookie('alliance') == x.target.parentElement.children[0].outerText)joinAllianceButt.innerHTML = 'Leave';
        if (!getcookie('alliance') == x.target.parentElement.children[0].outerText)joinAllianceButt.innerHTML = 'Join';

    }
    function appendAlli() {
        let rrr;
        fetchAllianceData('/allianceInfo', '*', data => {
            if (!data.includes('{')) return alert('', data);
            data = JSON.parse(data);
            for (let i = 0; i < data.length; i++) {
                rrr = alliContent.bodyTable.appendChild(document.createElement('tr'));
                rrr.setAttribute('class', 'alliance-card')
                rrr.innerHTML = `<td class=\'alliance-name\'>${data[i].name}</td>
                <td class=\'alliance-memberNo\'>${data[i].members.split(';').length - 1}</td>
                <td class=\'alliance-bases\'>${data[i].bases}</td>`
                rrr.onclick = showAllicard

            }
        })
    }
    function newCARD(a, b, c) {
        let e = createElement('tr', { class: 'player-card' });
        let f = [createElement('td'), createElement('td'), createElement('td')];
        f[0].setAttribute('class', 'player-name');
        f[1].setAttribute('class', 'player-alliance');
        f[2].setAttribute('class', 'player-bases');
        f[0].append(document.createTextNode(a));
        f[1].append(document.createTextNode(b));
        f[2].append(document.createTextNode(c));
        e.append(...f)
        communityContent.table.append(e)
    }
    function joinOrLeaveAlli(x) {
        if (x.target.outerText.toLocaleLowerCase() == 'join') {
            fetch('/joinAlliance', {
                method: 'post',
                body: JSON.stringify({alliname: infoName.outerText }),
                headers: { "Content-Type": "application/json" }
            }).then(data => data.text()).then(data => {
                alert('',data);
                console.log(data);
            })
            return
        }
        if (x.target.outerText.toLocaleLowerCase() == 'leave') {
            fetch('/leaveAlliance', {
                method: 'post',
                body: JSON.stringify({alliname:infoName.outerText }),
                headers: { "Content-Type": "application/json" }
            }).then(data => data.text()).then(data => {
                alert('',data)
                console.log(data);
            })
        }

    }
    function disbandAlliance() {
        fetch('disbandAlliance',{
            method: 'DELETE',
            body: JSON.stringify({ alliname: infoName.outerText }),
            headers: { "Content-Type": "application/json" }
        }).then(data=>data.text()).then(data=>{
            alert('',data)
        })
    }
    joinAllianceButt.onclick = joinOrLeaveAlli;
    disbandAllianceButt.onclick = disbandAlliance;
    return {
        appendPlayerData: newCARD,
        updateUserData: update,
        appendAlliances:appendAlli
    }
})();
navigator.clipboard.readText().then(console.log)