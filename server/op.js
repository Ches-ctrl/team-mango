/**
 * Utility for applying operations to sheets.
 * Based on Fortune Sheet's operation model.
 */
const _ = require('lodash');
const { Sheet } = require('./models/Sheet');

/**
 * @param {import("mongodb").Collection} collection mongodb collection
 * @param {any[]} ops op list
 */
async function applyOp(collection, ops) {
  const operations = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const op of ops) {
    const { path, id } = op;
    // Important: In the original demo, they use 'id' as the field name, not 'sheetId'
    const filter = { id };
    
    if (op.op === "insertRowCol") {
      /**
       * special op: insertRowCol
       */
      const field = op.value.type === "row" ? "r" : "c";
      let insertPos = op.value.index;
      if (op.value.direction === "rightbottom") {
        insertPos += 1;
      }
      operations.push({
        updateOne: {
          filter,
          update: {
            $inc: {
              [`data.$[e].${field}`]: op.value.count,
            },
          },
          arrayFilters: [{ [`e.${field}`]: { $gte: insertPos } }],
        },
      });
    } else if (op.op === "deleteRowCol") {
      /**
       * special op: deleteRowCol
       */
      const field = op.value.type === "row" ? "r" : "c";
      operations.push(
        // delete cells
        {
          updateOne: {
            filter,
            update: {
              $pull: {
                data: {
                  [field]: {
                    $gte: op.value.start,
                    $lte: op.value.end,
                  },
                },
              },
            },
          },
        },
        // decr indexes
        {
          updateOne: {
            filter,
            update: {
              $inc: {
                [`data.$[e].${field}`]: -(
                  op.value.end -
                  op.value.start +
                  1
                ),
              },
            },
            arrayFilters: [{ [`e.${field}`]: { $gte: op.value.start } }],
          },
        }
      );
    } else if (op.op === "addSheet") {
      /**
       * special op: addSheet
       */
      operations.push({ insertOne: { document: op.value } });
    } else if (op.op === "deleteSheet") {
      /**
       * special op: deleteSheet
       */
      operations.push({ deleteOne: { filter } });
    } else if (
      path.length >= 3 &&
      path[0] === "data" &&
      _.isNumber(path[1]) &&
      _.isNumber(path[2])
    ) {
      /**
       * cell update
       */
      const key = ["data.$[e].v", ...path.slice(3)].join(".");
      const [, r, c] = path;
      const options = { arrayFilters: [{ "e.r": r, "e.c": c }] };
      const updater =
        op.op === "remove"
          ? {
              $unset: {
                [key]: "",
              },
            }
          : {
              $set: {
                [key]: op.value,
              },
            };
      if (path.length === 3) {
        const cellExists = await collection.countDocuments(
          {
            ...filter,
            data: {
              $elemMatch: {
                r,
                c,
              },
            },
          },
          { limit: 1 }
        );
        if (cellExists) {
          operations.push({
            updateOne: { filter, update: updater, ...options },
          });
        } else {
          operations.push({
            updateOne: {
              filter,
              update: {
                $addToSet: {
                  data: {
                    r,
                    c,
                    v: op.value,
                  },
                },
              },
            },
          });
        }
      } else {
        operations.push({
          updateOne: { filter, update: updater, ...options },
        });
      }
    } else if (path.length === 2 && path[0] === "data" && _.isNumber(path[1])) {
      // entire row operation
      console.error("row assigning not supported");
    } else if (path.length === 0 && op.op === "add") {
      // add new sheet
      operations.push({ insertOne: { document: op.value } });
    } else if (path[0] !== "data") {
      // other config update
      if (op.op === "remove") {
        operations.push({
          updateOne: {
            filter,
            update: {
              $unset: {
                [op.path.join(".")]: "",
              },
            },
          },
        });
      } else {
        operations.push({
          updateOne: {
            filter,
            update: {
              $set: {
                [op.path.join(".")]: op.value,
              },
            },
          },
        });
      }
    } else {
      console.error("unprocessable op", op);
    }
  }
  
  // Execute all operations
  if (operations.length > 0) {
    try {
      await collection.bulkWrite(operations);
      console.log(`Successfully applied ${operations.length} operations`);
    } catch (error) {
      console.error('Error applying operations:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }
}

/**
 * Sanitize an object for MongoDB (replace dots in keys)
 */
function sanitizeForMongoDB(obj) {
  if (!obj || typeof obj !== 'object') return;
  
  if (Array.isArray(obj)) {
    obj.forEach(item => sanitizeForMongoDB(item));
  } else {
    Object.keys(obj).forEach(key => {
      if (key.includes('.')) {
        const newKey = key.replace(/\./g, '_');
        obj[newKey] = obj[key];
        delete obj[key];
        sanitizeForMongoDB(obj[newKey]);
      } else {
        sanitizeForMongoDB(obj[key]);
      }
    });
  }
}

// Apply operations to a sheet
async function applyOperations(sheetId, operations, context) {
  console.log(`Applying operations to sheet ${sheetId}:`, operations);
  
  try {
    // Find the sheet
    const sheet = await Sheet.findOne({ _id: sheetId });
    
    if (!sheet) {
      console.error(`Sheet ${sheetId} not found`);
      throw new Error(`Sheet ${sheetId} not found`);
    }
    
    // Update context if provided
    if (context !== undefined) {
      sheet.context = context;
    }
    
    // Process each operation
    for (const op of operations) {
      // Handle cell update operations
      if (op.t === 'cell') {
        // Find the sheet in the data array
        const sheetData = Array.isArray(sheet.data) ? 
          sheet.data.find(s => s.id === op.id || s.name === op.name) : 
          sheet.data;
        
        if (!sheetData) {
          console.error(`Sheet data not found for operation:`, op);
          continue;
        }
        
        // Ensure data is a 2D array
        if (!sheetData.data || !Array.isArray(sheetData.data)) {
          sheetData.data = Array(sheetData.row || 100).fill(null).map(() => Array(sheetData.column || 26).fill(null));
        }
        
        // Ensure the row exists
        if (!sheetData.data[op.r]) {
          sheetData.data[op.r] = Array(sheetData.column || 26).fill(null);
        }
        
        // Update the cell value
        sheetData.data[op.r][op.c] = op.v;
      }
      // Handle other operation types as needed
      // ...
    }
    
    // Save the updated sheet
    await sheet.save();
    console.log(`Operations applied successfully to sheet ${sheetId}`);
    
    return sheet;
  } catch (error) {
    console.error(`Error applying operations to sheet ${sheetId}:`, error);
    throw error;
  }
}

module.exports = {
  applyOp,
  applyOperations
}; 