<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>House BL {{ $house['numero_hbl'] }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 9px; color: #111827; }
        .encabezado-logo { width: 100%; margin-bottom: 4px; }
        .encabezado-logo img { height: 55px; }
        .marca-empresa { font-size: 18px; color: #042753; font-weight: bold; margin: 0; }
        .marca-sub { font-size: 9px; color: #71BFA6; font-weight: bold; letter-spacing: 1px; }

        table.form { width: 100%; border-collapse: collapse; margin-top: 2px; }
        table.form td { border: 1px solid #111827; padding: 6px 8px; vertical-align: top; min-height: 30px; }
        table.form.pegada { margin-top: -1px; }
        .etiqueta { font-size: 7.5px; color: #4b5563; margin: 0; }
        .valor { font-size: 9px; color: #111827; margin: 2px 0 0; white-space: pre-line; }
        .valor.fuerte { font-weight: bold; }

        .titulo-bl { text-align: right; font-size: 12px; font-weight: bold; color: #042753; margin: 0; }
        .bl-numeros { text-align: right; font-size: 10px; font-weight: bold; margin: 2px 0 0; }

        .legal-recibo { font-size: 7px; color: #374151; text-align: justify; margin: 0 0 4px; }

        .sello {
            display: inline-block; border: 2px solid #b91c1c; color: #b91c1c; font-weight: bold;
            font-size: 13px; padding: 2px 10px; margin: 3px 0; letter-spacing: 1px;
        }

        table.carga { width: 100%; border-collapse: collapse; }
        table.carga th, table.carga td {
            border: 1px solid #111827; padding: 8px; font-size: 8.5px; vertical-align: top;
            white-space: pre-line; min-height: 90px;
        }
        table.carga th { background-color: #f3f4f6; text-align: left; }
        table.carga td.derecha, table.carga th.derecha { text-align: right; }

        .boilerplate { text-align: center; font-size: 8px; margin: 6px 0; }
        .pagina { text-align: right; font-size: 8px; margin: 4px 0; }

        .fletes-tabla { width: 100%; border-collapse: collapse; margin-top: -1px; }
        .fletes-tabla th, .fletes-tabla td {
            border: 1px solid #111827; padding: 3px 6px; font-size: 8.5px;
        }
        .fletes-tabla th { background-color: #f3f4f6; text-align: left; }
        .fletes-tabla td.derecha, .fletes-tabla th.derecha { text-align: right; }

        .watermark-logo {
            position: fixed; top: 260px; left: -60px; width: 700px;
            opacity: 0.12; transform: rotate(-25deg); z-index: -1;
        }
        .watermark-nota {
            text-align: center; font-size: 10px; font-style: italic; color: #6b7280;
            transform: rotate(-2deg); margin: 0 0 2px;
        }

        .pagina-terminos { page-break-before: always; }
        h2.terminos-titulo { text-align: center; font-size: 13px; color: #042753; margin: 0 0 8px; }
        .terminos { font-size: 6.7px; line-height: 1.35; text-align: justify; column-count: 2; column-gap: 14px; }
        .terminos p { margin: 0 0 5px; }
        .terminos strong { font-weight: bold; }
    </style>
</head>
<body>
    @if ($mostrarLogo ?? true)
        <table class="encabezado-logo">
            <tr>
                <td style="border: none; padding: 0;">
                    <img src="{{ public_path('images/logoOpenAccess.png') }}">
                </td>
            </tr>
        </table>
    @endif

    @if (($tipo ?? '') === 'dam')
        <img src="{{ public_path('images/logoOpenAccess.png') }}" class="watermark-logo">
        <p class="watermark-nota">DOCUMENTO VÁLIDO PARA REGISTRO DE DAM</p>
    @endif

    <table class="form">
        <tr>
            <td style="width: 50%;">
                <p class="etiqueta">Shipper</p>
                <p class="valor fuerte">{{ $embarque['shipper_nombre'] ?? '—' }}</p>
                @if ($embarque['shipper_direccion'])
                    <p class="valor">{{ $embarque['shipper_direccion'] }}</p>
                @endif
            </td>
            <td>
                <p class="etiqueta">Ref.</p>
                <p class="titulo-bl">BILL OF LADING No.</p>
                <p class="bl-numeros">(M) {{ $embarque['mbl'] ?? '—' }}</p>
                <p class="bl-numeros">(H) {{ $house['numero_hbl'] }}</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Consignee (if "to order" so indicate)</p>
                <p class="valor fuerte">{{ $embarque['consignatario_nombre'] ?? '—' }}</p>
                @if ($embarque['consignatario_nit'])
                    <p class="valor">NIT {{ $embarque['consignatario_nit'] }}</p>
                @endif
                <p class="valor">{{ $embarque['consignatario_direccion'] ?? '—' }}</p>
            </td>
            <td>
                <p class="etiqueta">Name of Carrier</p>
                @if (! empty($tipoEtiqueta))
                    <p class="sello">{{ $tipoEtiqueta }}</p>
                @endif
                <p class="valor fuerte">OPEN ACCESS BOLIVIA SRL</p>
                <p class="valor">Dirección Av. Arce No 2631 Edif. Multicine Piso 8 Of 802</p>
                <p class="valor">Teléfono 591 22912411 — La Paz, Bolivia</p>
                <p class="legal-recibo" style="margin-top: 6px;">
                    RECEIVED by the Carrier the Goods as specified below in apparent good order and
                    condition unless otherwise stated, to be transported to such place as agreed
                    authorised or permitted herein and subject to all terms and conditions appearing on
                    the front and reverse of this Bill of Lading to which the Merchant agrees by
                    accepting this Bill of Lading any local privileges and Customs notwithstanding.
                </p>
                <p class="legal-recibo">
                    The particulars given below as stated by the Shipper and the weight, measure,
                    quantity, condition, content and value of Goods are unknown to the Carrier.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Notify Party</p>
                <p class="valor">SAME AS ABOVE</p>
            </td>
            <td>
                <p class="etiqueta">For Delivery of Goods, Please Apply to</p>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <p class="etiqueta">Ocean Vessel &amp; Voyage No.</p>
                <p class="valor">{{ $embarque['nave'] ?? '—' }} / {{ $embarque['viaje'] ?? '—' }}</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Pre-carriage by</p>
                <p class="valor">XXXXXXXXXX</p>
            </td>
            <td>
                <p class="etiqueta">Place of Receipt</p>
                <p class="valor">XXXXXXXXXX</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Port of Loading</p>
                <p class="valor">{{ $embarque['pol'] ?? '—' }}</p>
            </td>
            <td>
                <p class="etiqueta">Port of Discharge</p>
                <p class="valor">{{ $embarque['pod'] ?? '—' }}</p>
            </td>
        </tr>
        <tr>
            <td>
                <p class="etiqueta">Place of Delivery</p>
                <p class="valor">{{ $embarque['destino_final'] ?? 'XXXXXXXX' }}</p>
            </td>
            <td>
                <p class="etiqueta">Final Destination (For Customs Reference Only)</p>
                <p class="valor">XXXXXXXXX</p>
            </td>
        </tr>
    </table>

    <table class="carga">
        <thead>
            <tr>
                <th style="width: 26%;">Container No. &amp; Seal No.<br>Marks and Nos</th>
                <th>Description of Goods</th>
                <th class="derecha" style="width: 14%;">Gross Weight<br>(Kilos)</th>
                <th class="derecha" style="width: 14%;">Measurement<br>(Cubic Meter)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($contenedores as $item)
                <tr>
                    <td>
                        {{ $item['numero_contenedor'] ?? '—' }} / {{ $item['numero_sello'] ?? '—' }}
                        / {{ \App\Support\FormatoContenedor::conPies($item['tipo_contenedor']) }}
                    </td>
                    <td>
                        Said to contain<br>
                        {{ $item['descripcion_mercancia'] ?? '—' }}
                    </td>
                    <td class="derecha">{{ number_format((float) $item['peso_kg'], 2) }}</td>
                    <td class="derecha">{{ number_format((float) $item['volumen_cbm'], 2) }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="4" style="border-top: none;">
                    <div class="boilerplate">
                        SHIPPER'S LOAD, STOW, WEIGHT COUNT &amp; SEAL<br>
                        {{ $resumenContenedores }} - {{ $embarque['tipo_servicio'] ?? 'FCL' }}<br>
                        CARGO IN TRANSIT TO BOLIVIA
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <p class="pagina">PAGE 1 OF 1</p>

    <table class="form pegada">
        <tr>
            <td style="width: 30%;">
                <p class="etiqueta">Currency</p>
                <p class="valor fuerte">US DOLAR</p>
            </td>
            <td style="width: 40%;">
                <p class="etiqueta">Freight payable at</p>
                <p class="valor fuerte">FREIGHT {{ strtoupper($house['condicion_pago']) }}</p>
            </td>
            <td>
                <p class="etiqueta">Place and Date of Issue</p>
                <p class="valor">{{ $embarque['pol'] ?? '—' }} &nbsp; {{ $house['fecha_emision'] ?? '—' }}</p>
            </td>
        </tr>
    </table>

    <table class="fletes-tabla">
        <thead>
            <tr>
                <th style="width: 25%;">&nbsp;</th>
                <th class="derecha">Freight &amp; Charges Prepaid</th>
                <th class="derecha">Freight &amp; Charges Collect</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>OCEAN FREIGHT</td>
                <td class="derecha">
                    {{ $house['condicion_pago'] === 'Prepaid' ? $house['flete_valor_texto'] : '-' }}
                </td>
                <td class="derecha">
                    {{ $house['condicion_pago'] === 'Collect' ? $house['flete_valor_texto'] : '-' }}
                </td>
            </tr>
            <tr><td>&nbsp;</td><td class="derecha">-</td><td class="derecha">-</td></tr>
            <tr><td>&nbsp;</td><td class="derecha">-</td><td class="derecha">-</td></tr>
            <tr><td>&nbsp;</td><td class="derecha">-</td><td class="derecha">-</td></tr>
        </tbody>
        <tfoot>
            <tr>
                <td style="font-weight: bold;">Total freight</td>
                <td class="derecha" style="font-weight: bold;">
                    {{ $house['condicion_pago'] === 'Prepaid' ? $house['flete_valor_texto'] : '' }}
                </td>
                <td class="derecha" style="font-weight: bold;">
                    {{ $house['condicion_pago'] === 'Collect' ? $house['flete_valor_texto'] : '' }}
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="pagina-terminos">
        <h2 class="terminos-titulo">TERMS AND CONDITIONS</h2>
        <div class="terminos">
            <p><strong>1. DEFINITIONS</strong><br>
            "Carrier" means the Company stated on the front of this Bill of Lading and on whose behalf this Bill of Lading has been signed.<br>
            "Merchant" includes the shipper, the consignee, the receiver of the Goods, the holder of this Bill of Lading, any person owning or entitled to the possession of the Goods or this Bill of Lading and anyone having a present or future interest in the Goods or any person acting on behalf of the above mentioned persons.<br>
            "Goods" includes the whole of the cargo and any container, pallet or similar article of transport used to consolidate Goods supplied by or on behalf of the Merchant.<br>
            "Carriage" means the whole of the operations and services undertaken or performed by or on behalf of the Carrier in respect of the Goods.<br>
            "Combined Transport" arises where the Carriage called for by this Bill of Lading is not a Port to Port Shipment.<br>
            "Hague Rules" means the provisions of the International Convention for Unification of certain Rules relating to Bills of Lading signed at Brussels on 25th August 1924.<br>
            "Hague-Visby Rules" means the Hague Rules as amended by the Protocol signed at Brussels on 23rd February 1968.<br>
            "COGSA" means the Carriage of Goods by Sea Act of the United States of America adopted on 16th April 1936.<br>
            "COGWA" means the Carriage of Goods by Water Act 1936 of Canada.<br>
            "Charges" includes freight and all expenses and money obligations incurred and payable by the Merchant.<br>
            "Shipping Unit" includes freight unit and the term "unit" as used in the Hague Rules and Hague-Visby Rules.<br>
            "Person" includes an individual, a partnership, a body corporate or other entity.<br>
            "Stuffed" includes filled, consolidated, loaded or secured.</p>

            <p><strong>2 CARRIER'S TARIFF</strong><br>
            The provisions of the Carrier's applicable Tariff, if any, are incorporated herein. Copies of such provisions are obtainable from the Carrier on application as provided for by the applicable Tariff regulations. In the case of any inconsistency between this Bill of Lading and the applicable Tariff, this Bill of Lading shall prevail.</p>

            <p><strong>3 WARRANTY</strong><br>
            The Merchant warrants that in agreeing to the terms hereof he is or is the agent of and has the authority of the person owning or entitled to the possession of the Goods and all persons who may have an interest in the Goods or this Bill of Lading to be bound by the terms hereof.</p>

            <p><strong>4 NEGOTIABILITY AND TITLE TO THE GOODS</strong><br>
            (1) This Bill of Lading shall be non-negotiable unless made out "to order" in which event it shall be negotiable and shall constitute title to the Goods and the holder shall be entitled to receive or to transfer the Goods herein described.<br>
            (2) The Carrier shall be entitled to treat the bearer of the Bill of Lading if made out "to order" and the endorsee thereof, or if not made "to order" the Consignee named therein, as being the person entitled to receive delivery of the Goods and to give a good discharge for the same, and the production of the Bill of Lading before delivery of the Goods shall not be required as a condition of such delivery.<br>
            (3) If a person, other than a party to whom this Bill of Lading has been transferred pursuant to sub-clause 4(2) above, or a person for whose benefit a right of suit may in law be vested in a party to whom this Bill of Lading has been so transferred, makes a claim under this Bill of Lading or is identified as "Merchant" hereunder, such person shall, ipso facto, be bound by all terms and conditions hereof.</p>

            <p><strong>5 CERTAIN RIGHTS AND IMMUNITIES FOR THE CARRIER AND OTHER PERSONS</strong><br>
            (1) The Carrier shall be entitled to sub-contract on any terms the whole or any part of the Carriage.<br>
            (2) The Merchant undertakes that no claim or allegation shall be made against any person or vessel whatsoever, other than the Carrier, including but not limited to, the Carrier's servants or agents, any independent contractor and his servants or agents, and all others by whom the whole or any part of the Carriage is performed, directly or indirectly, is procured, performed or undertaken, whom imposes or attempts to impose upon any such person any liability whatsoever in connection with the Goods or the Carriage, and if any such claim or allegation should nevertheless be made, to indemnify the Carrier against all consequences thereof.<br>
            (3) Without prejudice to the foregoing every such person or vessel shall have the benefit of all provisions herein benefiting the Carrier as if such provisions were expressly for his benefit and in entering into this contract the Carrier, to the extent of these provisions, does so not only on his own behalf but also as agent or trustee for such persons and vessels and such persons and vessels shall to this extent be or be deemed to be parties to this contract.<br>
            (4) The Merchant shall defend, indemnify and hold harmless the Carrier against any claim or liability arising and however this Bill of Lading is issued, incorporating solely the arbitration clause of the Vessel's charterparty.</p>

            <p><strong>6 CARRIER'S RESPONSIBILITY</strong><br>
            (1) CLAUSE PARAMOUNT<br>
            (A) Subject to Clause 13 below, the Bill of Lading in so far as it relates to sea carriage by any vessel whether named or not shall have effect subject to the Hague Rules unless legislation is compulsorily applicable (such as the Hague-Visby Rules or Canadian or Australian legislation) to this Bill of Lading in which case such applicable legislation shall be deemed incorporated herein. If and to the extent that any term of this Bill of Lading is repugnant to the Hague Rules or such other compulsorily applicable legislation, such term shall be void to that extent but no further.<br>
            (B) Carrier shall be entitled to and shall have the benefit of all rights, defences, exceptions and limits provided in the Hague Rules or COGSA or COGWA, as applicable.<br>
            (2) PORT TO PORT SHIPMENT<br>
            The responsibility of the Carrier is limited to that part of the Carriage from the port of loading to the port of discharge and the Carrier shall not be liable for loss or damage whatsoever arising prior to loading or after discharging over the vessel's rail or if applicable on the ship's ramp, howsoever such loss or damage may be caused.<br>
            (3) COMBINED TRANSPORT<br>
            Save as otherwise provided in this Bill of Lading, if the Carriage is combined transport, the Carrier shall be liable for loss or damage to the Goods occurring between the time when the Carrier takes the Goods in his charge and the time of delivery.</p>

            <p><strong>7 MERCHANT'S RESPONSIBILITY</strong><br>
            (1) The description and particulars of the Goods set out on the face hereof are furnished by the Merchant and the Merchant warrants to the Carrier that the description and particulars including but not limited to weight, measurement, quantity, condition, marks and value are correct.<br>
            (2) The Merchant shall comply with all applicable laws, regulations and requirements of customs, port and other authorities and shall bear and pay all duties, taxes, fines, imposts, expenses and losses incurred or suffered by reason of any breach of the foregoing or by reason of any illegal incorrect or insufficient marking, numbering or addressing of the Goods.</p>

            <p><strong>8 CONTAINERS</strong><br>
            (1) Goods may be stuffed by the Carrier in or containers provided by or on behalf of the Merchant.<br>
            (2) If a Container has not been stuffed by or on behalf of the Carrier, the Carrier shall not be liable for loss of or damage to the Goods.<br>
            (3) If the Container is stuffed by or on behalf of the Merchant, the Merchant undertakes that the stuffing of the Container is properly and carefully done and that the Container is fit for carriage.</p>

            <p><strong>9 TEMPERATURE CONTROLLED CARGO</strong><br>
            The Merchant undertakes not to tender for transportation any Goods which require temperature control without previously giving written notice of such requirements to the Carrier and having the same stated on the face of this Bill of Lading.</p>

            <p><strong>10 INSPECTION OF GOODS</strong><br>
            The Carrier or any person authorised by the Carrier shall be entitled, but under no obligation to open any Container or package at any time and inspect the Goods.</p>

            <p><strong>11 MATTERS AFFECTING PERFORMANCE</strong><br>
            The Carrier shall use reasonable endeavours to complete the Carriage and to deliver the Goods but shall not be liable for any loss, damage or delay however caused if the fulfilment of the contract as evidenced by this Bill of Lading is in any way hindered, restricted, prevented or otherwise affected by any circumstances whatsoever beyond its reasonable control.</p>

            <p><strong>12 METHODS AND ROUTE OF TRANSPORTATION</strong><br>
            The Carrier may at any time and without notice use any means of transport or storage whatsoever, load or carry the Goods on any vessel whether named on the front hereof or not, transfer the Goods from one conveyance to another, proceed by any route and comply with any orders or recommendations given by any government or authority.</p>

            <p><strong>13 DECK CARGO (AND LIVESTOCK)</strong><br>
            Goods carried on deck or under deck at Carrier's option shall not be deemed to be carried under the Hague Rules or Hague-Visby Rules as applicable but shall be carried subject to the terms of this Bill of Lading.</p>

            <p><strong>14 DELIVERY OF GOODS</strong><br>
            If delivery of the Goods or any part thereof is not taken by the Merchant at the time and place when and where the Carrier is entitled to call upon the Merchant to take delivery thereof, the Carrier shall be entitled without notice to remove the Goods and to store them at the risk and expense of the Merchant.</p>

            <p><strong>15 BOTH-TO-BLAME COLLISION</strong><br>
            If the vessel comes into collision with another vessel as a result of the negligence of the other vessel and any act, neglect or default of the Carrier, the Merchant will indemnify the Carrier against all loss or liability to the other or non-carrying vessel insofar as such loss or liability represents loss of or damage to the Goods.</p>

            <p><strong>16 GENERAL AVERAGE</strong><br>
            General Average shall be adjusted at any port or place at the Carrier's option and shall be settled in accordance with the York-Antwerp Rules 1974, or any amendment thereof.</p>

            <p><strong>17 CHARGES</strong><br>
            The Merchant shall be liable for and shall indemnify the Carrier in respect of all Charges relating to the Goods.</p>

            <p><strong>18 LIEN</strong><br>
            The Carrier shall have a lien on the Goods for any amount due at any time to the Carrier from the Merchant.</p>

            <p><strong>19 VARIATION OF THE CONTRACT</strong><br>
            No servant or agent of the Carrier shall have power to waive or vary any of the terms hereof unless such waiver or variation is in writing and is specifically authorised in writing by a director of the Carrier.</p>

            <p><strong>20 PARTIAL INVALIDITY</strong><br>
            If any provision in this Bill of Lading is held to be invalid or unenforceable by any court or regulatory or self regulatory agency or body, such invalidity shall not affect the validity of the remaining provisions of this Bill of Lading.</p>

            <p><strong>21 LAW AND JURISDICTION</strong><br>
            The contract evidenced by or contained in this Bill of Lading is governed by the law of Hong Kong and any claim or dispute arising hereunder shall be determined by the Courts in Hong Kong and no other Court.</p>
        </div>
    </div>
</body>
</html>
