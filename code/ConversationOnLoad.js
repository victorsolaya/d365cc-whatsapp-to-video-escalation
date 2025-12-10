async function StartVideoCallIfWhatsApp() {
    try {
        const conversationId = await Microsoft.Omnichannel.getConversationId();
        console.log("Conversation ID received:", conversationId);

        const result = await Xrm.WebApi.retrieveRecord(
            "msdyn_ocliveworkitem",
            conversationId,
            "?$select=msdyn_channel"
        );

        const channel = result["msdyn_channel"];
        console.log("Conversation channel:", channel);

        // 192360000 = WhatsApp
        if (channel != 192360000) { return; }
        const videoCallContext = await GetVideoCallContext(conversationId);
        if (videoCallContext !== true) { return; }
        TriggerVideoCallCustomApi(conversationId);
        console.log("Preparing request with GUID:", conversationId);


    } catch (error) {
        console.error("Error during video call process:", error.message);
    }
}

async function TriggerVideoCallCustomApi(conversationId) {

    var execute_CCaaS_StartSecondaryChannel_Request = {
        // Parameters
        entity: { entityType: "msdyn_ocliveworkitem", id: conversationId }, // entity
        ApiVersion: "1.0", // Edm.String
        SecondaryChannelType: "Video", // Edm.String

        getMetadata: function () {
            return {
                boundParameter: "entity",
                parameterTypes: {
                    entity: { typeName: "mscrm.msdyn_ocliveworkitem", structuralProperty: 5 },
                    ApiVersion: { typeName: "Edm.String", structuralProperty: 1 },
                    SecondaryChannelType: { typeName: "Edm.String", structuralProperty: 1 }
                },
                operationType: 0, operationName: "CCaaS_StartSecondaryChannel"
            };
        }
    };

    Xrm.WebApi.execute(execute_CCaaS_StartSecondaryChannel_Request).then(
        function success(response) {
            if (response.ok) { console.log("Success"); }
        }
    ).catch(function (error) {
        console.log(error.message);
    });

}

async function GetVideoCallContext(workItemId) {
  try {
    var query =
      "?$filter=_msdyn_ocliveworkitemid_value eq " + workItemId +
      "&$select=msdyn_name,msdyn_value";

    var result = await Xrm.WebApi.retrieveMultipleRecords(
      "msdyn_ocliveworkitemcontextitem",
      query
    );

    console.log("All Context Items:", result.entities);

    var videoCallItem = result.entities.find(function (item) {
      return item.msdyn_name === "VideoCall";
    });

    if (videoCallItem) {
      console.log("VideoCall Found:", videoCallItem.msdyn_value);
      return videoCallItem.msdyn_value; // true / false
    } else {
      console.log("VideoCall not found");
      return null;
    }

  } catch (error) {
    console.error("Error retrieving context items:", error.message);
    throw error;
  }
}


StartVideoCallIfWhatsApp()