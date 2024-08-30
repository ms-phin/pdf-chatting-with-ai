import PlaceholderDocument from "./PlaceholderDocument";

export default function Documents() {
  return (
    <div className="flex flex-col pb-10 bg-slate-300">
      <h2 className="text-blue-500 font-semibold pb-5 ml-2 mt-2 text-xl">
        My Documents
      </h2>
      <div className="flex justify-center items-center w-full h-full">
        <PlaceholderDocument />
      </div>
    </div>
  );
}
