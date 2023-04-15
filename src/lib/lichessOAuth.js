import { provider } from "@lucia-auth/oauth";

//import { createUrl, handleRequest, authorizationHeaders } from "@lucia-auth/oauth/request.js";
//import { scope, provider } from "@lucia-auth/oauth/core.js";

export const lichess = (auth, config ) => {

	const getAuthorizationUrl = async (state) => {
		const url = createUrl("https://lichess.org/oauth", {
			response_type: "code",
			client_id: config.clientId,
			scope: scope(["identify"], config.scope),
			redirect_uri: config.redirectUri,
			state
		});
		return url;
	};

	const getTokens = async (code) => {
		const request = new Request("https://lichess.org/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: new URLSearchParams({
				client_id: config.clientId,
				grant_type: "authorization_code",
				redirect_uri: config.redirectUri,
				code
			}).toString()
		});
		const tokens = await handleRequest(request);

		return {
			accessToken: tokens.access_token,
			accessTokenExpiresIn: tokens.expires_in
		};
	};

	const getProviderUser = async (accessToken) => {
		const request = new Request("https://lichess.org/api/account", {
			/*headers: authorizationHeaders("bearer", accessToken)*/
			headers: {
				Authorization: ["Bearer", token].join(" ")
			}
		});
		const { lichessUser } = await handleRequest(request);
		return [lichessUser.id, lichessUser];
	};

	return provider(auth, {
		providerId: 'lichess',
		getAuthorizationUrl,
		getTokens,
		getProviderUser
	});
}

	// createUrl from @lucia-auth/oauth/request.js
	const createUrl = (base, urlSearchParams = {}) => {
	    const url = new URL(base);
	    for (const [key, value] of Object.entries(urlSearchParams)) {
		url.searchParams.set(key, value);
	    }
	    return url;
	};
	// scope from @lucia-auth/oauth/core.js
	const scope = (base, config = []) => {
	    return [...base, ...(config ?? [])].join(" ");
	};
	// handleRequest from request.js
	const handleRequest = async (request) => {
	    request.headers.set("User-Agent", "lucia");
	    request.headers.set("Accept", "application/json");
	    const response = await fetch(request);
	    if (!response.ok) {
		const getErrorBody = async () => {
		    try {
			return await response.json();
		    }
		    catch {
			return null;
		    }
		};
		const errorBody = getErrorBody();
		throw new LuciaOAuthRequestError(response.status, errorBody);
	    }
	    return (await response.json());
	};
