export class DbUtilities {

    /**
 * Delete a collection, in batches of batchSize. Note that this does
 * not recursively delete subcollections of documents in the collection
 */
  static deleteCollection(db, collectionRef) {
    return new Promise((resolve, reject) =>  {
      collectionRef.get()
      .then((snapshot) => {
          var batch = db.batch();
          snapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
          });
          return batch.commit().then(() => {
              return snapshot.size;
          });
      }).then((numDeleted) => {
              resolve(numDeleted);
      })
      .catch(reject);
    });
  }

}