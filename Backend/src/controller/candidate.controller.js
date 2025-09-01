import Candidate from "../model/candidate.model.js"
import uploadFile from "../utils/cloudinary.js";

export const candidateRegister = async (req, res) => {
  try {
    const { name, party, slogan } = req.body;

    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("req.headers['content-type']:", req.headers['content-type']);

    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required." });
    }

    const result = await uploadFile(req.file.path);
    const logoUrl = result.secure_url;

    const candidate = new Candidate({
      name,
      party,
      slogan,
      logo: logoUrl,
    });

    await candidate.save();
    res.status(201).json({ message: "Candidate registered", candidate });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export default candidateRegister;