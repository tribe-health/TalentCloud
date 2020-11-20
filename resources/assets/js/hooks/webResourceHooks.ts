import { useCallback, useEffect, useState } from "react";
import { deleteRequest, getRequest, putRequest } from "../helpers/httpRequests";

type Json = any;

// Used when fetch() throws an exception, ie due to a network error.
interface RequestError {
  error: Error;
  type: "RequestError";
}

// Used when the response has a non-200 status code.
interface ApiError {
  error: Error;
  response: Response;
  type: "ApiError";
}

// Used when response.json() or parseResponse return throw an exception.
interface ParseError {
  error: Error;
  response: Response;
  type: "ParseError";
}

type HttpError = RequestError | ApiError | ParseError;

type ResourceStatus = "updating" | "success" | "error" | "deleted";

export async function handleResponse<T>(
  responsePromise: Promise<Response>,
  parseResponse: (json: Json) => T,
  handleError: (e: HttpError) => void,
): Promise<T> {
  let response: Response;
  try {
    response = await responsePromise;
  } catch (error) {
    handleError({ error, type: "RequestError" });
    throw error;
  }

  if (!response.ok) {
    const error = new Error(response.statusText);
    handleError({
      error,
      response,
      type: "ApiError",
    });
    throw error;
  }

  let newValue: T;
  try {
    const json: Json = await response.json();
    newValue = parseResponse(json);
  } catch (error) {
    handleError({
      error,
      response,
      type: "ParseError",
    });
    throw error;
  }
  return newValue;
}

export async function handleResponseWithoutData(
  request: Promise<Response>,
  handleError: (e: HttpError) => void,
): Promise<void> {
  let response: Response;
  try {
    response = await request;
  } catch (error) {
    handleError({ error, type: "RequestError" });
    throw error;
  }

  if (!response.ok) {
    const error = new Error(response.statusText);
    handleError({
      error,
      response,
      type: "ApiError",
    });
    throw error;
  }
}

export function useResource<T>(
  endpoint: string,
  parseResponse: (response: Json) => T,
  initialValue: T,
  handleError: (e: HttpError) => void,
): {
  value: T;
  status: ResourceStatus;
  update: (newValue: T) => Promise<T>;
  deleteResource: () => Promise<void>;
  refresh: () => Promise<T>;
} {
  const [{ value, status }, setState] = useState<{
    value: T;
    status: ResourceStatus;
  }>({
    value: initialValue,
    status: "success",
  });
  const internalHandleError = useCallback(
    (e: HttpError): void => {
      setState((prevState) => ({ value: prevState.value, status: "error" }));
      handleError(e);
    },
    [setState, handleError],
  );

  const refresh = useCallback(
    async function refreshMemo(): Promise<T> {
      setState((prevState) => ({
        value: prevState.value,
        status: "updating",
      }));
      const request = getRequest(endpoint);
      const responseValue = await handleResponse(
        request,
        parseResponse,
        internalHandleError,
      );
      setState({
        value: responseValue,
        status: "success",
      });
      return responseValue;
    },
    [endpoint, parseResponse, setState, internalHandleError],
  );

  const update = useCallback(
    async function updateMemo(newValue: T): Promise<T> {
      setState((prevState) => ({
        value: prevState.value,
        status: "updating",
      }));
      const request = putRequest(endpoint, newValue);
      const responseValue = await handleResponse(
        request,
        parseResponse,
        internalHandleError,
      );
      setState({
        value: responseValue,
        status: "success",
      });
      return responseValue;
    },
    [endpoint, parseResponse, setState, internalHandleError],
  );

  const deleteResource = useCallback(
    async function deleteResourceMemo(): Promise<void> {
      setState((prevState) => ({
        value: prevState.value,
        status: "updating",
      }));
      const request = deleteRequest(endpoint);
      await handleResponseWithoutData(request, internalHandleError);
      setState((prevState) => ({
        value: prevState.value,
        status: "deleted",
      }));
    },
    [endpoint, internalHandleError, setState],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { value, status, update, refresh, deleteResource };
}
