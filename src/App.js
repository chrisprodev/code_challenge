import React, { useRef, useState } from "react";
import Moveable from "react-moveable";
import { getImages } from "./services/images.service";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  /**
   * Adds a new moveable component to the array of moveable components.
   * The new component is created with random properties and an image selected from a list of images.
   */
  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    // Fetches a list of images asynchronously
    const IMAGES = await getImages();

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        image: `url('${
          IMAGES[Math.floor(Math.random() * IMAGES.length)]
        }')`,
        updateEnd: true,
      },
    ]);
  };

  /**
   * Deletes a moveable component from the array of moveable components based on its ID.
   * Updates the array by removing the component with the specified ID.
   *
   * @param {number} id - The ID of the moveable component to delete.
   */
  const deleteMoveable = (id) => {
    const newMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );

    setMoveableComponents(newMoveables);
  };

  /**
   * Updates a moveable component in the array of moveable components based on its ID.
   * Finds the component with the specified ID and updates its properties with the provided new component.
   * Optionally, the `updateEnd` flag can be set to determine if the moveable component should update on the end of a move operation.
   *
   * @param {number} id - The ID of the moveable component to update.
   * @param {object} newComponent - The new component object containing updated properties.
   * @param {boolean} updateEnd - Optional. Determines if the moveable component should update on the end of a move operation. Default is `false`.
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map(
      (moveable, i) => {
        if (moveable.id === id) {
          return { id, ...newComponent, updateEnd };
        }
        return moveable;
      }
    );
    setMoveableComponents(updatedMoveables);
  };

  /**
   * Handles the start of a resize operation on a moveable component.
   * Logs the direction of the resize operation.
   * Checks if the resize operation is coming from the left handle.
   * If so, it saves the initial left and width values of the moveable component and sets up an event handler to update the left value based on the change in width.
   *
   * @param {number} index - The index of the moveable component being resized.
   * @param {object} e - The event object containing information about the resize operation.
   */
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      // const initialLeft = e.left;
      // const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main className="main_container">
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            deleteMoveable={deleteMoveable}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  image,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  deleteMoveable,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    image,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      image,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = e.drag.transform;
    //ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: image,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={() => setSelected(id)}
      >
        <button onClick={() => deleteMoveable(id)}>Delete</button>
      </div>
      <Moveable
        target={ref.current}
        resizable
        draggable
        snappable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            image,
          });
        }}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={[
          "nw",
          "n",
          "ne",
          "w",
          "e",
          "sw",
          "s",
          "se",
        ]}
        edge={false}
        zoom={1}
        origin={false}
        bounds={{
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          position: "css",
        }}
        snapThreshold={5}
        verticalGuidelines={[50, 150, 250, 450, 550]}
        horizontalGuidelines={[0, 100, 200, 400, 500]}
      />
    </>
  );
};
