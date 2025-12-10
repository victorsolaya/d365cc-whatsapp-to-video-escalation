async function SendVidecallUrl() {
    var conversationId = await Microsoft.Omnichannel.getConversationId()
    console.log("Conversation Id:", conversationId);

    var conversationResult = await Xrm.WebApi.retrieveRecord("msdyn_ocliveworkitem", cId, "?$select=_msdyn_activeagentid_value")
    let agentid = conversationResult["_msdyn_activeagentid_value"];

    var agentUser = await Xrm.WebApi.retrieveRecord("systemuser", agentid, "?$select=internalemailaddress")
    var email = agentUser["internalemailaddress"];
    const powerpagesURL = "https://yourpowerpages.powerappsportals.com/?conversationId="
        + encodeURIComponent(conversationId)
        + "&agentId=" + encodeURIComponent(agentid)
        + "&email=" + encodeURIComponent(email);

    //Second parameter is false, because it will be send directly to the chat instead of the sendbox.
    Microsoft.Omnichannel.sendMessageToConversation(powerpagesURL, false, cId);
    console.log("Sent link:", powerpagesURL);
}