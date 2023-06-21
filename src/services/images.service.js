import { mappedImage } from "../mappers/image.mapper";

export const getImages = async () => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/photos"
    );
    const data = await response.json();

    return mappedImage(data);
  } catch (error) {
    console.log({
      message: "Something went wrong when calling getImages",
      error,
    });
  }
};
