/**
* Copyright 2018 Attivio Inc., All rights reserved.
*/
package com.attivio.suitback.controllers;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.attivio.suitback.controllers.UserController.UserDetails;
import com.google.gson.Gson;

@CrossOrigin
@Controller
public class RestProxy {
  @Value("${suit.attivio.protocol}")
  String attivioProtocol;
  @Value("${suit.attivio.hostname}")
  String attivioHostname;
  @Value("${suit.attivio.port}")
  int attivioPort;
  @Value("${suit.attivio.username}")
  String attivioUsername;
  @Value("${suit.attivio.password}")
  String attivioPassword;

  /**
  * Forward query requests through to the real Attivio server only after
  * adding the current user's info
  */
  @RequestMapping("/rest/searchApi/**")
  @ResponseBody
  public ResponseEntity<String> mirrorQuery(@RequestBody(required=false) String body, HttpMethod method, HttpServletRequest request,
    HttpServletResponse response) throws URISyntaxException {
    String newBody;
    UserDetails userInfo = UserController.getUserDetails();
    if (userInfo != null) {
      // Parse the request object and add the username to it so the
      // search is done on that user's behalf
      Gson gson = new Gson();
      @SuppressWarnings("unchecked")
      Map<String, Object> bodyObject = gson.fromJson(body, Map.class);
      bodyObject.put("username", userInfo.getUserId());
      newBody = gson.toJson(bodyObject);
    } else {
      newBody = body;
    }
    return this.mirrorRest(newBody, method, request, response);      
  }
  
  /**
   * Forward all uncaught requests through to the real Attivio server
   */
  @RequestMapping("/rest/**")
  @ResponseBody
  public ResponseEntity<String> mirrorRest(@RequestBody(required=false) String body, HttpMethod method, HttpServletRequest request,
    HttpServletResponse response) throws URISyntaxException {
    URI uri = new URI(attivioProtocol, null, attivioHostname, attivioPort, request.getRequestURI(), request.getQueryString(), null);
    
    // Make sure we include the headers from the incoming request when we pass it on.
    HttpHeaders headers = new HttpHeaders();
    Enumeration<String> headerNames = request.getHeaderNames();
    while (headerNames.hasMoreElements()) {
      String headerName = headerNames.nextElement();
      Enumeration<String> headersForName = request.getHeaders(headerName);
      while (headersForName.hasMoreElements()) {
        String singleHeaderValue = headersForName.nextElement();
        headers.add(headerName, singleHeaderValue);
      }
    }
    // And add our special origin header too.
    headers.add("origin", "suit-app");
    
    // Add the basic authorization header for the username/password used to talk to to the Attivio back-end 
    try {
      String authValue;
      authValue = new String(Base64.encodeBase64((this.attivioUsername + ":" + this.attivioPassword).getBytes("UTF-8")), "UTF-8");
      headers.add("Authorization", "Basic " + authValue);
    } catch (UnsupportedEncodingException e1) {
      e1.printStackTrace();
    }
    
    // We need to use the Apache HTTP code to allow the GZIPped contents to work right.
    HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory(
        HttpClientBuilder.create().build());

    // Allow the HTTP client to deal with the default Attivio self-signed certificate
    if ("https".equalsIgnoreCase(attivioProtocol)) {
      SSLConnectionSocketFactory socketFactory;
      try {
        socketFactory = new SSLConnectionSocketFactory(new SSLContextBuilder().loadTrustMaterial(null, new TrustSelfSignedStrategy()).build(), NoopHostnameVerifier.INSTANCE);
        CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(socketFactory).build();
        clientHttpRequestFactory.setHttpClient(httpClient);      
      } catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }
    
    RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory);
    ResponseEntity<String> responseEntity = null;
    try {
      responseEntity = restTemplate.exchange(uri, method, new HttpEntity<String>(body, headers), String.class);
      
      // Filter out any Transfer-Encoding headers
      HttpHeaders updatedResponseHeaders = new HttpHeaders();
      Set<Entry<String, List<String>>> responseHeaderEntries = responseEntity.getHeaders().entrySet();
      for (Entry<String, List<String>> responseHeaderEntry : responseHeaderEntries) {
        boolean skipHeader = false;
        if ("Transfer-Encoding".equals(responseHeaderEntry.getKey())) {
          skipHeader = true;
        }
        if (!skipHeader) {
          updatedResponseHeaders.put(responseHeaderEntry.getKey(), responseHeaderEntry.getValue());
        }
      }
      String realBody;
        realBody = responseEntity.getBody();
      responseEntity = new ResponseEntity<String>(realBody, updatedResponseHeaders, responseEntity.getStatusCode());
    } catch (RestClientException e) {
      e.printStackTrace();
      if (e instanceof HttpServerErrorException) {
        // Got an error from the back end.. make sure we pass it on...
        String responseBody = ((HttpServerErrorException)e).getResponseBodyAsString();
        HttpStatus statusCode = ((HttpServerErrorException)e).getStatusCode();
        System.out.println(responseBody);
        
        responseEntity = new ResponseEntity<>(responseBody, statusCode);
      }
    }
    return responseEntity;
  }
}