const toggleClickIndex = {
  google: 0,
};

$.fn.toggleClick = function (provider) {
  const self = this;
  return function () {
    console.log(arguments, self);
    const methods = arguments; // Store the passed arguments for future reference
    const count = methods.length; // Cache the number of methods

    // Use return this to maintain jQuery chainability
    // For each element you bind to
    return self.each((i, item) => {
      // Bind a click handler to that element

      $(item).on("click", function () {
        // That when called will apply the 'index'th method to that element
        // the index % count means that we constrain our iterator between 0
        // and (count-1)
        return methods[toggleClickIndex[provider]++ % count].apply(
          self,
          arguments
        );
      });
    });
  };
};

async function listGoogleFiles() {
  const {
    result: { files },
  } = await gapi.client.drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });

  let content = "";
  files.forEach(({ name }) => {
    content += `<tr>
      <td>${name}</td>
      <td>Google</td>
      <td>-</td>
    </tr>`;
  });

  $("#file-content").html(content);
}

function updateUIWhenAuthChange(provider, isLoggedIn) {
  if (isLoggedIn) {
    $(`#connect-${provider} .status`).text("Status: Connected");
    toggleClickIndex[provider] = 1;
  } else {
    $(`#connect-${provider} .status`).text("Status: Not Connected");
    toggleClickIndex[provider] = 0;
  }
}

function getGoogleAuthStatus(isLoggedIn) {
  updateUIWhenAuthChange("google", isLoggedIn);
  if (isLoggedIn) {
    listGoogleFiles();
  }
}

function handleGoogleClientLoad() {
  gapi.load("client:auth2", async () => {
    await window.gapi.client.init({
      apiKey: "AIzaSyD_gNp3AUgJsj0_5ughmUcMfYTVmRROK7Y",
      clientId:
        "288594933692-bl6293o1ejf3feosb1por8hslt4qfnjo.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
      scope: "https://www.googleapis.com/auth/drive",
    });

    gapi.auth2.getAuthInstance().isSignedIn.listen(getGoogleAuthStatus);
    getGoogleAuthStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

$(document).ready(() => {
  $("#connect-google").toggleClick("google")(
    () => {
      gapi.auth2.getAuthInstance().signIn();
      console.log(1);
    },
    () => {
      gapi.auth2.getAuthInstance().signOut();
      console.log(2);
    }
  );
});
