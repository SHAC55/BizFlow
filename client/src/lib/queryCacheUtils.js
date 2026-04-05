export const updateMatchingQueries = (queryClient, queryKeyPrefix, updater) => {
  const matchingQueries = queryClient.getQueriesData({
    queryKey: queryKeyPrefix,
  });

  matchingQueries.forEach(([queryKey, currentData]) => {
    if (currentData === undefined) {
      return;
    }

    queryClient.setQueryData(queryKey, updater(currentData));
  });
};

export const mapListItems = (data, listKey, mapper) => {
  if (!data || !Array.isArray(data[listKey])) {
    return data;
  }

  return {
    ...data,
    [listKey]: data[listKey].map(mapper),
  };
};
