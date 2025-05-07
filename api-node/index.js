const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());

const PORT = 3000;

// Unused
async function extractTableFromPDF(pdfBuffer) {
  try {
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    const lines = text.split("\n");

    const extractedData = lines
      .map((line) => {
        const regex =
          /^(?<empreendimento>.+?)\s+\|\s+(?<construtora>.+?)\s+\|\s+(?<bairro>.+?)\s+\|\s+(?<metragem>\d+ m²)\s+\|\s+(?<preco>R\$ [\d,.]+)\s+\|\s+(?<status>.+?)\s+\|\s+(?<rua>.+?)\s+\|\s+(?<entrega>\d{2}\/\d{2}\/\d{4})\s+\|\s+(?<unidade>\d+)\s+\|\s+(?<tipo>.+?)\s+\|\s+(?<vagas>\d+)/;

        const match = line.match(regex);
        if (match) {
          return {
            NomeEmpreendimento: match.groups.empreendimento,
            Construtora: match.groups.construtora,
            Bairro: match.groups.bairro,
            Metragem: match.groups.metragem,
            PrecoPorUnidade: match.groups.preco,
            Status: match.groups.status,
            NomeRua: match.groups.rua,
            DataEntrega: match.groups.entrega,
            Unidade: match.groups.unidade,
            Tipo: match.groups.tipo,
            Vagas: match.groups.vagas,
          };
        }

        return null;
      })
      .filter((data) => data);
    return extractedData;
  } catch (error) {
    console.error("Erro ao processar o PDF:", error);
    return [];
  }
}

app.post("/extract-table", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "Arquivo PDF não enviado." });
  }

  try {
    const data = await extractTableFromPDF(file.buffer);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro ao processar o PDF:", error);

    res
      .status(500)
      .json({ success: false, message: "Erro ao processar o PDF." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});